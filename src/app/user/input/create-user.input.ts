import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '@app/user/user.entity';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  firstName: string;

  @Field(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  lastName: string;

  @Field(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  @IsEmail()
  email: string;

  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Field(() => [String])
  @IsString({ each: true })
  clientIds: string[];
}
