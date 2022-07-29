import { Field, InputType } from '@nestjs/graphql';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateIncidentInput {
  @Field(() => String, { nullable: true })
  @IsISO8601()
  @IsString()
  @IsOptional()
  observedAt?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;
}
