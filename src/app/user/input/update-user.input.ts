import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '@app/user/user.entity';

@InputType()
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  @IsOptional()
  firstName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  @IsOptional()
  lastName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field(() => UserRole, { nullable: true })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @Field(() => [String], { nullable: true })
  @IsString({ each: true })
  @IsOptional()
  clientIds?: string[];
}
