import 'reflect-metadata';
import { ObjectType, Field, Int, registerEnumType, GraphQLISODateTime } from '@nestjs/graphql';
import { PersonOfInterestGender } from '../person-of-interest.entity';

registerEnumType(PersonOfInterestGender, {
  name: 'PersonOfInterestGender',
});

@ObjectType()
export class PersonOfInterestObject {
  @Field(() => Int)
  number: number;

  @Field(() => String)
  id: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt: Date;

  /*========================================================================*/

  @Field(() => String)
  clientId: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  bornAt?: Date;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => PersonOfInterestGender, { nullable: true })
  gender?: PersonOfInterestGender;
}
