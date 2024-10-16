import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { ListDTO, UserDTO } from './user.dto';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(RedisService)
    private readonly redisService: RedisService,
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

  async cacheUser(name: string) {
    await this.redis.lpush('users', name);
  }

  async cachedUsers(): Promise<string[]> {
    return await this.redis.lrange('users', 0, -1);
  }
}
