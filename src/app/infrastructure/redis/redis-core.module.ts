import type { DynamicModule, OnModuleDestroy } from '@nestjs/common';
import { Global, Module, Inject } from '@nestjs/common';
import { isArray, each } from 'lodash';

import {
  createAsyncClientOptions,
  createClient,
  type RedisClient,
} from './redis-client.provider';
import { REDIS_MODULE_OPTIONS, REDIS_CLIENT } from './redis.constants';
import type {
  RedisModuleAsyncOptions,
  RedisModuleOptions,
} from './redis.interface';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisCoreModule implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_MODULE_OPTIONS)
    private readonly options: RedisModuleOptions | RedisModuleOptions[],
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClient,
  ) {}

  /**
   *
   */
  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    return {
      module: RedisCoreModule,
      imports: options.imports,
      providers: [createClient(), createAsyncClientOptions(options)],
      exports: [RedisService],
    };
  }

  /**
   *
   */
  onModuleDestroy() {
    const closeConnection =
      ({ clients, defaultKey }) =>
      (options) => {
        const name = options.name || defaultKey;
        const client = clients.get(name);

        if (client && !options.keepAlive) {
          client.disconnect();
        }
      };

    const closeClientConnection = closeConnection(this.redisClient);

    if (isArray(this.options)) {
      each(this.options, closeClientConnection);
    } else {
      closeClientConnection(this.options);
    }
  }
}
