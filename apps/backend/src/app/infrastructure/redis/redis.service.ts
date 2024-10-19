import { Injectable, Inject } from '@nestjs/common';
import type { Redis } from 'ioredis';

import { type RedisClient, RedisClientError } from './redis-client.provider';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClient,
  ) {}

  /**
   * Get client.
   */
  getClient(name?: string): Redis {
    if (!name) {
      name = this.redisClient.defaultKey;
    }

    const client = this.redisClient.clients.get(name);
    if (!client) {
      throw new RedisClientError(`client ${name} does not exist`);
    }
    return client;
  }

  /**
   * Get clients.
   */
  getClients(): Map<string, Redis> {
    return this.redisClient.clients;
  }
}
