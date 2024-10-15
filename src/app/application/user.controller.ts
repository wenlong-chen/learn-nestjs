import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { Request } from 'express';
import { UserService } from '../domain/user/user.service';
import { UserDTO } from '../domain/user/user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getHello(): string {
    return this.userService.getHello();
  }

  /**
   * @description Create a user
   * @param user
   */
  @Post('/users')
  async createUser(@Body() user: UserDTO) {
    return this.userService.createUser(user);
  }

  /**
   * @description Get all users
   */
  @Get('/users')
  async getUsers() {
    return this.userService.findAll();
  }

  /**
   * @description Cache a user
   * @param name
   */
  @Post('/cache')
  async cacheUser(@Query('name') name: string) {
    await this.userService.cacheUser(name);
    return { message: 'User cached' };
  }

  /**
   * @description Get all cached users
   * @returns
   */
  @Get('/cache')
  async cachedUsers(): Promise<string[]> {
    return await this.userService.cachedUsers();
  }

}
