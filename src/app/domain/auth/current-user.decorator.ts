import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Decorator that gets the current user from the request.
 */
export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  return context.switchToHttp().getRequest().user;
});
