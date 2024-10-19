import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

import { UserEntity } from './user.entity';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { CreateUserInput } from '../../application/user/create-user.input';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(RedisService)
    private readonly redisService: RedisService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly pubSub: PubSub,
  ) {}

  get redis() {
    return this.redisService.getClient('default');
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getUserByID(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async getUserByName(name: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { name } });
  }

  async getUsers(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async createUser(input: CreateUserInput): Promise<UserEntity> {
    const user = this.userRepository.create(input);
    console.log('repo create user', user);
    await this.userRepository.save(user);
    console.log('repo save user', user);
    await this.pubSub.publish('userCreated', user);
    return user;
  }

  async cacheUserInRedis(name: string) {
    await this.redis.lpush('users', name);
  }

  async cachedUsersInRedis(): Promise<string[]> {
    return await this.redis.lrange('users', 0, -1);
  }

  async cacheUserInCacheManager(input: CreateUserInput) {
    await this.cacheManager.set(`user:${input.name}`, input);
  }

  async getUserFromCacheManager(name: string) {
    return await this.cacheManager.get(`user:${name}`);
  }
}
