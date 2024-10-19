import { Process, Processor } from '@nestjs/bull';
import { CAT_QUEUE } from './cat.const';
import { CatService } from './cat.service';
import { Job } from 'bull';

@Processor(CAT_QUEUE)
export class CatProcessor {
  constructor(private readonly catService: CatService) {}

  @Process()
  async process(job: Job<{ name: string }>) {
    console.log('Processing job:', job.id);
    const { data } = job;
    await this.catService.processCat(data.name);
  }
}
