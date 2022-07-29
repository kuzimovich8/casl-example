import { Field, InputType } from '@nestjs/graphql';
import { IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class UpdateClientInput {
  @Field(() => String, { nullable: true })
  @MaxLength(128)
  @MinLength(3)
  @IsString()
  name?: string;
}
