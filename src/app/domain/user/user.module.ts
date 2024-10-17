import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisOptions } from 'ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

import { UserController } from '../../application/user.controller';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    CacheModule.registerAsync<RedisOptions>({
      useFactory: (configService: ConfigService) => ({
        isGlobal: true,
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number | undefined>('REDIS_PORT'),
        tls: configService.get<string | undefined>('REDIS_TLS')
          ? {}
          : undefined,
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
