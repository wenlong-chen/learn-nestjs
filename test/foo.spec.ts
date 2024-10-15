import Redis from 'ioredis-mock';

describe('Test redis', () => {


  it('redis', async () => {
    const redis = new Redis();
    await redis.set('foo', 'bar');
    console.log(await redis.get('foo'));
    expect(await redis.get('foo')).toBe('bar');
  });
});