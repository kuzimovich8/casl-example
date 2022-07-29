import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@ArgsType()
export class GetPersonsOfInterestArgs {
  @Field(() => [String], { nullable: true })
  @IsString({ each: true })
  @IsOptional()
  ids?: string[];

  @Field(() => [String], { nullable: true })
  @IsString({ each: true })
  @IsOptional()
  clientIds?: string[];
}
