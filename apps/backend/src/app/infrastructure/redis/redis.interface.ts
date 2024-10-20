import type {
  ModuleMetadata,
  InjectionToken,
  OptionalFactoryDependency,
} from '@nestjs/common/interfaces';
import type { Redis, RedisOptions } from 'ioredis';

export interface RedisModuleOptions extends RedisOptions {
  name?: string;
  url?: string;
  onClientReady?(client: Redis): void;
}

export interface RedisModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: unknown[]
  ) =>
    | RedisModuleOptions
    | RedisModuleOptions[]
    | Promise<RedisModuleOptions>
    | Promise<RedisModuleOptions[]>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}
