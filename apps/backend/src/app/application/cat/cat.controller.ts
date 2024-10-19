import { Controller, Get, Post, Query } from '@nestjs/common';
import { CatService } from '../../domain/cat/cat.service';

@Controller()
export class CatController {
  constructor(private readonly catService: CatService) {}
  @Post('/cats')
  async enqueueCat(@Query('name') name: string) {
    await this.catService.enqueueCat(name);
    return name;
  }

  @Get('/cats')
  async getCats() {
    return this.catService.getCompletedCats();
  }
}
