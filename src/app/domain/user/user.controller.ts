import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO } from './user.dto';

@Controller()
export class UserController {
  constructor(private readonly appService: UserService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * @description Create a user
   * @param user
   */
  @Post('/users')
  async createUser(@Body() user: UserDTO) {
    return this.appService.createUser(user);
  }

  /**
   * @description Get all users
   */
  @Get('/users')
  async getUsers() {
    return this.appService.findAll();
  }
}
