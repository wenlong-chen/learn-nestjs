import { v4 as uuid } from 'uuid';
import { INestApplication } from '@nestjs/common';
import { Redis as RedisType } from 'ioredis';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Queue } from 'bull';
import { CreateUserInput } from '../src/app/application/user/create-user.input';
import Redis from 'ioredis-mock';
import { QueueMock } from './mocks/bull/queue.mock';
import { CAT_QUEUE } from '../src/app/domain/cat/cat.const';
import { createCache, memoryStore } from 'cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule, DYNAMIC_MODULES } from '../src/app/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisService } from '../src/app/infrastructure/redis/redis.service';
import { getQueueToken } from '@nestjs/bull';
import { supertestWs } from "supertest-graphql";
import gql from "graphql-tag";
import * as request from "supertest";

describe('Subscription Test', () => {
  let app: INestApplication;
  let redis: RedisType;
  let cache: Cache;
  let queue: Queue;
  let user: CreateUserInput;

  beforeAll(async () => {
    redis = new Redis();
    queue = new QueueMock(CAT_QUEUE);
    cache = createCache(memoryStore());

    user = {
      name: 'Test User',
      jsonColumn: { foo: 'bar' },
      arrayColumn: [{ foo: 'bar' }, { foo: 'baz' }],
      varcharColumn: '',
      booleanColumn: false,
      uuidColumn: uuid(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DYNAMIC_MODULES['TypeOrmModule'])
      .useModule(
        TypeOrmModule.forRootAsync({
          useFactory: () => {
            return {
              type: 'sqlite' as const,
              database: `:memory:`,
              entities: [__dirname + '/../**/*.entity{.ts,.js}'],
              synchronize: true,
            };
          },
        }),
      )
      .overrideProvider(RedisService)
      .useValue({
        getClient: () => redis,
      })
      .overrideProvider(getQueueToken(CAT_QUEUE))
      .useValue(queue)
      .overrideProvider(CACHE_MANAGER)
      .useValue(cache)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.listen(0, '0.0.0.0');
  });

  afterAll(async () => {
    await queue.close();
    await app.close();
  });


  it('Subscribe to user created event', async () => {
    const sub = await supertestWs(app.getHttpServer()).subscribe(gql`
        subscription {
            userCreated {
                name
            }
        }
    `);

    await request(app.getHttpServer())
      .post('/users')
      .send({ ...user, name: 'tom' })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toEqual('tom');
      });

    const data = await sub.next();
    expect(data).toEqual({ data: { userCreated: { name: 'tom' } } });
  });
});
