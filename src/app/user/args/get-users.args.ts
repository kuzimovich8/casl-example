import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class GetUsersArgs {
  @Field(() => [String], { nullable: true })
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  @IsOptional()
  ids: string[];

  @Field(() => [String], { nullable: true })
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  @IsOptional()
  withClientIds: string[];
}
