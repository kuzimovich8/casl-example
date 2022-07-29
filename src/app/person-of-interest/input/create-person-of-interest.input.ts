import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsISO8601, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PersonOfInterestGender } from '../person-of-interest.entity';

@InputType()
export class CreatePersonOfInterestInput {
  @Field(() => String)
  @IsString()
  clientId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsISO8601()
  @IsString()
  @IsOptional()
  bornAt?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @MinLength(1)
  @IsOptional()
  notes?: string;

  @Field(() => PersonOfInterestGender, { nullable: true })
  @IsEnum(PersonOfInterestGender)
  @IsOptional()
  gender?: PersonOfInterestGender;
}
