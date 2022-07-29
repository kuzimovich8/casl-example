import 'reflect-metadata';
import { ObjectType, Field, registerEnumType, GraphQLISODateTime } from '@nestjs/graphql';
import { UserRole, UserStatus } from '@app/user/user.entity';

registerEnumType(UserStatus, {
  name: 'UserStatus',
});

registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType()
export class UserObject {
  @Field(() => String)
  id: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String)
  email: string;

  @Field(() => UserStatus)
  status: UserStatus;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt: Date;
}
