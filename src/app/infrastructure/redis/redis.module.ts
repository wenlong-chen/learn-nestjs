import type { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';

import { RedisCoreModule } from './redis-core.module';
import type { RedisModuleAsyncOptions } from './redis.interface';

@Module({})
export class RedisModule {
  /**
   * Async register
   */
  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.forRootAsync(options)],
    };
  }
}
