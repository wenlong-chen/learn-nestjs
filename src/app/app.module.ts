import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from './domain/user/user.module';
import { RedisModule } from './infrastructure/redis/redis.module';

export const dynamicModules: Record<
  'ConfigModule' | 'RedisModule' | 'TypeOrmModule',
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
};

@Module({
  imports: [
    dynamicModules['ConfigModule'],
    dynamicModules['RedisModule'],
    dynamicModules['TypeOrmModule'],
    UserModule,
  ],
})
export class AppModule {}
