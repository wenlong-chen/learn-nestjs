import * as Bull from 'bull';
import { Queue, Job } from 'bull';
import { Redis as RedisType, RedisOptions } from 'ioredis';
import Redis from 'ioredis-mock';
import { map } from 'lodash';
import { DYNAMIC_MODULES } from "../../src/app/app.module";

describe('try bull', () => {
  let redis: RedisType;
  let queue: Queue;

  beforeAll(() => {
    const bullModule = DYNAMIC_MODULES['BullModule'];
    console.log(bullModule);
    redis = new Redis();
    // queue = new Bull('test-queue', 'redis://localhost:6379');
    queue = new Bull('test-queue', {
      createClient: () => redis,
    });

    queue.process(async (job: Job) => {
      // sleep 5s
      await new Promise((resolve) => setTimeout(resolve, 10000));
      console.log('processing job', job.data);
    });
  });

  afterAll(async () => {
    await queue.close();
  });

  it('should pass', async () => {
    await queue.add({ foo: 'bar' });
    await queue.add({ foo: 'baz' });

    // sleep 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const completed = await queue.getCompleted();
    console.log(
      map(completed, (job) => ({
        queue: job.queue.name,
        data: job.data,
        id: job.id,
        finishedOn: job.finishedOn,
      })),
    );
    expect(true).toBe(true);
  });
});
