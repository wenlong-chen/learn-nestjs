import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { UserModule } from './domain/user/user.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { CatModule } from './domain/cat/cat.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule } from "@nestjs/cache-manager";
import { RedisOptions } from "ioredis";
import { redisStore } from "cache-manager-ioredis-yet";
import { AuthModule } from "./domain/auth/auth.module";

export const DYNAMIC_MODULES: Record<
  | 'ConfigModule'
  | 'RedisModule'
  | 'TypeOrmModule'
  | 'BullModule'
  | 'CacheModule'
  | 'GraphQLModule',
  DynamicModule
> = {
  ConfigModule: ConfigModule.forRoot({
    isGlobal: true,
    load: [
      () => ({
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT
          ? parseInt(process.env.DB_PORT, 10)
          : undefined,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_DATABASE: process.env.DB_DATABASE,
      }),
    ],
  }),
  RedisModule: RedisModule.forRootAsync({
    useFactory: (configService: ConfigService) => [
      {
        name: 'default',
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number | undefined>('REDIS_PORT'),
        tls: configService.get<string | undefined>('REDIS_TLS')
          ? {}
          : undefined,
      },
      {
        name: 'keyExpireSubscriber', // WARNING: This client is intended for use only in chat-typing.service. Do not use in other places.
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
      },
      {
        name: 'pubsubPublisher',
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        tls: configService.get<string | undefined>('REDIS_TLS')
          ? {}
          : undefined,
        keyPrefix: 'pubsub',
      },
      {
        name: 'pubsubSubscriber',
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        tls: configService.get<string | undefined>('REDIS_TLS')
          ? {}
          : undefined,
        keyPrefix: 'pubsub',
      },
    ],
    inject: [ConfigService],
  }),
  TypeOrmModule: TypeOrmModule.forRootAsync({
    useFactory: () => ({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      columnTypes: {
        jsonb: 'text',
      },
    }),
  }),
  BullModule: BullModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      redis: {
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        tls: configService.get<string | undefined>('REDIS_TLS')
          ? {}
          : undefined,
      },
    }),
    inject: [ConfigService],
  }),
  CacheModule: CacheModule.registerAsync<RedisOptions>({
    useFactory: (configService: ConfigService) => ({
      store: redisStore,
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number | undefined>('REDIS_PORT'),
      tls: configService.get<string | undefined>('REDIS_TLS')
        ? {}
        : undefined,
    }),
    isGlobal: true,
    imports: [ConfigModule],
    inject: [ConfigService],
  }),
  GraphQLModule: GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    subscriptions: {
      'graphql-ws': true,
      'subscriptions-transport-ws': true,
    },
    autoSchemaFile: 'schema.gql',
  }),
};

@Module({
  imports: [
    DYNAMIC_MODULES['ConfigModule'],
    DYNAMIC_MODULES['RedisModule'],
    DYNAMIC_MODULES['TypeOrmModule'],
    DYNAMIC_MODULES['BullModule'],
    DYNAMIC_MODULES['CacheModule'],
    DYNAMIC_MODULES['GraphQLModule'],
    UserModule,
    CatModule,
    AuthModule,
  ],
})
export class AppModule {}
