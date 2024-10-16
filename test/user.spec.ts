import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Redis as RedisType } from 'ioredis';
import Redis from 'ioredis-mock';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AppModule, DYNAMIC_MODULES } from '../src/app/app.module';
import { RedisService } from '../src/app/infrastructure/redis/redis.service';

describe('UserController', () => {
  let app: INestApplication;
  let redis: RedisType;
  beforeAll(async () => {
    redis = new Redis();
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
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
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
      .send({
        name: 'Test User',
        jsonColumn: {},
        varcharColumn: '',
        booleanColumn: false,
        uuidColumn: uuid(),
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toEqual('Test User');
        expect(res.body.id).toBeDefined();
      });
  });

  it('GET /users: get all created users', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toEqual(1);
        expect(res.body[0].name).toEqual('Test User');
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
});
