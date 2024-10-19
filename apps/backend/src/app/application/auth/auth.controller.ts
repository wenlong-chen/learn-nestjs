import { Controller, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../../domain/auth/local-auth.guard';

@Controller()
export class AuthController {
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login() {
    return { status: 'success' };
  }
}
