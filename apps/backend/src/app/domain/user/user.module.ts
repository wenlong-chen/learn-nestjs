import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';

import { UserController } from '../../application/user/user.controller';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { UserResolver } from '../../application/user/user.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    UserService,
    UserResolver,
    {
      provide: PubSub,
      useValue: new PubSub(),
    },
  ],
  exports: [UserService],
})
export class UserModule {}
