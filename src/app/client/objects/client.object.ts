import 'reflect-metadata';
import { ObjectType, Field, registerEnumType, GraphQLISODateTime } from '@nestjs/graphql';
import { ClientStatus } from '@app/client/client.entity';

registerEnumType(ClientStatus, {
  name: 'ClientStatus',
});

@ObjectType()
export class ClientObject {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => ClientStatus)
  status: ClientStatus;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt?: Date;
}
