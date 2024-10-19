import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthUser } from './auth-user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(name: string, pass: string): Promise<AuthUser | null> {
    const user = await this.userService.getUserByName(name);
    if (user?.name === pass) {
      return user;
    } else {
      return null;
    }
  }

  login(user: AuthUser) {
    const payload = { name: user.name, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
