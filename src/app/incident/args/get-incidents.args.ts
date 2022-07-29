import { ArgsType, Field } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class GetIncidentsArgs {
  @Field(() => [String], { nullable: true })
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  @IsOptional()
  ids?: string[];

  @Field(() => [String], { nullable: true })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  personOfInterestIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  clientIds?: string[];
}
