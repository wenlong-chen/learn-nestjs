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
import { UserDTO } from "../src/app/domain/user/user.dto";

describe('Demo Test', () => {
  let app: INestApplication;
  let redis: RedisType;
  let queue: Queue;
  let user: UserDTO;

  beforeAll(async () => {
    redis = new Redis();
    queue = new QueueMock(CAT_QUEUE);

    user = {
      name: 'Test User',
      jsonColumn: {'foo': 'bar'},
      arrayColumn: [{'foo': 'bar'}, {'foo': 'baz'}],
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
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await queue.close();
    await app.close();
  });

  it('GET /: hello', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('POST /users: create user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(user)
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual(expect.objectContaining(user));
        expect(res.body.id).toBeDefined();
        expect(res.body.createdAt).toBeDefined();
      });
  });

  it('GET /users: get all created users', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toEqual(1);
        expect(res.body).toEqual(expect.arrayContaining([expect.objectContaining(user)]));
      });
  });

  it('POST /cache: cache first user', () => {
    return request(app.getHttpServer())
      .post('/cache?name=foo')
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ message: 'User cached' });
      });
  });

  it('GET /cache: list cached users', () => {
    return request(app.getHttpServer())
      .get('/cache')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(['foo']);
      });
  });

  it('POST /cache: cache second user', () => {
    return request(app.getHttpServer())
      .post('/cache?name=bar')
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ message: 'User cached' });
      });
  });

  it('GET /cache: list cached users', () => {
    return request(app.getHttpServer())
      .get('/cache')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(['bar', 'foo']);
      });
  });

  it('POST /cats: create cat', () => {
    const queueAddSpy = jest.spyOn(queue, 'add');
    return request(app.getHttpServer())
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
});
