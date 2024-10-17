import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Redis as RedisType } from 'ioredis';
import Redis from 'ioredis-mock';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AppModule, DYNAMIC_MODULES } from '../src/app/app.module';
import { RedisService } from '../src/app/infrastructure/redis/redis.service';
import { getQueueToken } from '@nestjs/bull';
import { CAT_QUEUE } from '../src/app/domain/cat/cat.const';
import { QueueMock } from './mocks/bull/queue.mock';
import { Queue } from 'bull';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { createCache, memoryStore } from 'cache-manager';
import { CreateUserInput } from '../src/app/application/user/create-user.input';
import { supertestWs } from 'supertest-graphql';
import gql from 'graphql-tag';

describe('Demo Test', () => {
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
  });

  afterAll(async () => {
    await queue.close();
    await app.close();
  });

  it('GET /: hello', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('Save and get user using orm', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send(user)
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual(expect.objectContaining(user));
        expect(res.body.id).toBeDefined();
        expect(res.body.createdAt).toBeDefined();
      });
    await request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toEqual(1);
        expect(res.body).toEqual(
          expect.arrayContaining([expect.objectContaining(user)]),
        );
      });
  });

  it('Save and get user using redis', async () => {
    await request(app.getHttpServer())
      .post('/cache?name=foo')
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ message: 'User cached' });
      });

    await request(app.getHttpServer())
      .get('/cache')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(['foo']);
      });

    await request(app.getHttpServer())
      .post('/cache?name=bar')
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ message: 'User cached' });
      });

    await request(app.getHttpServer())
      .get('/cache')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(['bar', 'foo']);
      });
  });

  it('Save and get user using cache manager', async () => {
    await request(app.getHttpServer())
      .post('/users/cache-manager')
      .send(user)
      .expect(201)
      .expect(async (res) => {
        expect(res.body).toEqual({ message: 'User cached' });
      });

    await request(app.getHttpServer())
      .get(`/users/cache-manager?name=${user.name}`)
      .expect(200)
      .expect(async (res) => {
        expect(res.body).toEqual(expect.objectContaining(user));
      });
  });

  it('Put cat to bull queue', async () => {
    const queueAddSpy = jest.spyOn(queue, 'add');
    await request(app.getHttpServer())
      .post('/cats?name=garfield')
      .expect(201)
      .expect((res) => {
        expect(res.text).toEqual('garfield');
        expect(queueAddSpy).toHaveBeenCalledWith(
          { name: 'garfield' },
          { delay: 5000 },
        );
      });
  });

  it('Query user using graphql', async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `{
          users {
            name
          }
        }`,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.users).toEqual([{ name: 'Test User' }]);
      });
  });

});
