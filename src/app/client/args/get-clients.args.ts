import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class GetClientsArgs {
  @Field(() => [String], { nullable: true })
  @IsString({ each: true })
  @IsOptional()
  userIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  @IsOptional()
  ids?: string[];
}
