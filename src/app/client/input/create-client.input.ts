import { Field, InputType } from '@nestjs/graphql';
import { IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateClientInput {
  @Field(() => String)
  @MaxLength(128)
  @MinLength(3)
  @IsString()
  name: string;
}
