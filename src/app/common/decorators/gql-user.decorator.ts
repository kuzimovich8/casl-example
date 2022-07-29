import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CurrentUserData } from '@app/auth/auth.strategy';

export const GqlUser = createParamDecorator((data: unknown, context: ExecutionContext): CurrentUserData => {
  const ctx = GqlExecutionContext.create(context);
  const authUser = ctx.getContext().req.user as CurrentUserData;

  if (authUser) {
    return authUser;
  }

  return null;
});
