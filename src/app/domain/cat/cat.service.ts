import { Queue } from 'bull';
import { map } from 'lodash';

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';

import { CAT_QUEUE } from './cat.const';

@Injectable()
export class CatService {
  constructor(
    @InjectQueue(CAT_QUEUE)
    private readonly catQueue: Queue<{ name: string }>,
  ) {}

  async processCat(name: string) {
    console.log(`Processing cat: ${name}`);
  }

  async enqueueCat(name: string) {
    const job = await this.catQueue.add({ name }, {delay: 5000});
    console.log('add job:', job.id);
  }

  async getCompletedCats() {
    const jobs = await this.catQueue.getCompleted();
    return map(jobs, (job) => job.data);
  }
}
