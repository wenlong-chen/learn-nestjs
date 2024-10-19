import type { Provider } from '@nestjs/common';
import { Redis } from 'ioredis';
import { isArray, map } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { REDIS_CLIENT, REDIS_MODULE_OPTIONS } from './redis.constants';
import type {
  RedisModuleAsyncOptions,
  RedisModuleOptions,
} from './redis.interface';

export class RedisClientError extends Error {}
export interface RedisClient {
  defaultKey: string;
  clients: Map<string, Redis>;
  size: number;
}

/**
 * Get client.
 *
 * @param options
 */
async function getClient(options: RedisModuleOptions): Promise<Redis> {
  const { onClientReady, url, ...opt } = options;
  const client = url ? new Redis(url) : new Redis(opt);
  if (onClientReady) {
    onClientReady(client);
  }
  return client;
}

/**
 * Create client.
 */
export const createClient = (): Provider => ({
  provide: REDIS_CLIENT,
  useFactory: async (options: RedisModuleOptions | RedisModuleOptions[]): Promise<RedisClient> => {
    const clients = new Map<string, Redis>();
    let defaultKey = uuidv4();

    if (isArray(options)) {
      await Promise.all(
        map(options, async (o) => {
          const key = o.name || defaultKey;
          if (clients.has(key)) {
            throw new RedisClientError(
              `${o.name || 'default'} client is exists`,
            );
          }
          clients.set(key, await getClient(o));
        }),
      );
    } else {
      if (options.name && options.name.length !== 0) {
        defaultKey = options.name;
      }
      clients.set(defaultKey, await getClient(options));
    }

    return {
      defaultKey,
      clients,
      size: clients.size,
    };
  },
  inject: [REDIS_MODULE_OPTIONS],
});

/**
 * Create async client options.
 *
 * @param options
 */
export const createAsyncClientOptions = (options: RedisModuleAsyncOptions) => ({
  provide: REDIS_MODULE_OPTIONS,
  useFactory: options.useFactory,
  inject: options.inject,
});
