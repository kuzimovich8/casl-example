import 'reflect-metadata';
import { ObjectType, Field, GraphQLISODateTime, Int } from '@nestjs/graphql';

@ObjectType()
export class IncidentObject {
  @Field(() => Int)
  number: number;

  @Field(() => String)
  id: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt: Date;

  /*========================================================================*/

  @Field(() => GraphQLISODateTime, { nullable: true })
  observedAt?: Date;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String)
  personOfInterestId: string;
}
