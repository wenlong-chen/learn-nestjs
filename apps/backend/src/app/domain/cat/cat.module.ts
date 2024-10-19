import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CAT_QUEUE } from './cat.const';
import { CatController } from '../../application/cat/cat.controller';
import { CatService } from './cat.service';
import { CatProcessor } from './cat.processor';

@Module({
  imports: [BullModule.registerQueue({ name: CAT_QUEUE })],
  controllers: [CatController],
  providers: [CatService, CatProcessor],
})
export class CatModule {}
