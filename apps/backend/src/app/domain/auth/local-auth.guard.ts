import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from './auth-user.type';
import { AuthService } from './auth.service';
import { AUTH_COOKIE_NAME } from './constants';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor(private authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      return false;
    }

    const user: AuthUser = request.user;
    const jwt = this.authService.login(user);
    console.log(jwt);
    response.cookie(AUTH_COOKIE_NAME, jwt.access_token, { httpOnly: true });

    return true;
  }
}
