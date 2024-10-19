import { Redis as RedisType } from 'ioredis';
import Redis from 'ioredis-mock';

// ignore this test

xdescribe('try redis', () => {
  let redis: RedisType;
  beforeAll(() => {
    redis = new Redis();
  });

  it('should set and get value', async () => {
    await redis.set('key', 'value');
    const value = await redis.get('key');
    expect(value).toBe('value');
  });
});
