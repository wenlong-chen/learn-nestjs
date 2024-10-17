import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";

import { UserEntity } from './user.entity';
import { UserDTO } from './user.dto';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(RedisService)
    private readonly redisService: RedisService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  get redis() {
    return this.redisService.getClient('default');
  }

  getHello(): string {
    return 'Hello World!';
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async createUser(userDTO: UserDTO): Promise<UserEntity> {
    const user = this.userRepository.create(userDTO);
    return this.userRepository.save(user);
  }

  async cacheUserInRedis(name: string) {
    await this.redis.lpush('users', name);
  }

  async cachedUsersInRedis(): Promise<string[]> {
    return await this.redis.lrange('users', 0, -1);
  }

  async cacheUserInCacheManager(userDTO: UserDTO) {
    await this.cacheManager.set(`user:${userDTO.name}`, userDTO);
  }

  async getUserFromCacheManager(name: string): Promise<UserDTO> {
    return await this.cacheManager.get(`user:${name}`);
  }

}
