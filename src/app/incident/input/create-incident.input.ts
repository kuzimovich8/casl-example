import { Field, InputType } from '@nestjs/graphql';
import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateIncidentInput {
  @Field(() => String)
  @IsISO8601()
  @IsString()
  observedAt: string;

  @Field(() => String)
  @IsString()
  personOfInterestId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;
}
