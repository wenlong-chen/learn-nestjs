import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from 'express';
import { UserService } from '../../domain/user/user.service';
import { UserDTO } from './user.dto';
import { CreateUserInput } from "./create-user.input";
import { JwtAuthGuard } from "../../domain/auth/jwt-auth.guard";
import { CurrentUser } from "../../domain/auth/current-user.decorator";
import { AuthUser } from "../../domain/auth/auth-user.type";
import { AuthGuard } from "@nestjs/passport";

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
  @UseGuards(JwtAuthGuard)
  async createUser(@Body() user: CreateUserInput) {
    return this.userService.createUser(user);
  }

  /**
   * @description Get all users
   */
  @Get('/users')
  @UseGuards(JwtAuthGuard)
  async getUsers() {
    return await this.userService.getUsers();
  }

  /**
   * @description Cache a user
   * @param name
   */
  @Post('/cache')
  @UseGuards(JwtAuthGuard)
  async cacheUser(@Query('name') name: string) {
    await this.userService.cacheUserInRedis(name);
    return { message: 'User cached' };
  }

  /**
   * @description Get all cached users
   * @returns
   */
  @Get('/cache')
  @UseGuards(JwtAuthGuard)
  async cachedUsers(): Promise<string[]> {
    return await this.userService.cachedUsersInRedis();
  }

  /**
   * @description Cache a user in cache manager
   *
   * @param user
   */
  @Post('/users/cache-manager')
  @UseGuards(JwtAuthGuard)
  async cacheUserInCacheManager(@Body() user: CreateUserInput) {
    await this.userService.cacheUserInCacheManager(user);
    return { message: 'User cached' };
  }

  /**
   * @description Get a user from cache manager
   *
   * @param name
   */
  @Get('/users/cache-manager')
  @UseGuards(JwtAuthGuard)
  async getUserFromCacheManager(@Query('name') name: string) {
    return await this.userService.getUserFromCacheManager(name);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async me(
    @CurrentUser() user: AuthUser
  ) {
    return this.userService.getUserByID(user.id);
  }
}
