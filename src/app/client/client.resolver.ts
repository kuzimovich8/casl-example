import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenError } from '@casl/ability';
import { Connection } from 'typeorm';

import { ClientObject } from '@app/client/objects/client.object';
import { ClientService } from '@app/client/client.service';
import { GetClientsArgs } from '@app/client/args/get-clients.args';
import { CreateClientInput } from '@app/client/input/create-client.input';
import { UpdateClientInput } from '@app/client/input/update-client.input';
import { GqlUser } from '@app/common/decorators/gql-user.decorator';
import { GqlAuthGuard } from '@app/common/guards/gql-auth.guard';
import { PersonOfInterestService } from '@app/person-of-interest/person-of-interest.service';
import { CurrentUserData } from '@app/auth/auth.strategy';
import { ClientEntity } from '@app/client/client.entity';
import { UserRole } from '@app/user/user.entity';

@Resolver(ClientObject)
export class ClientResolver {
  constructor(
    private clientService: ClientService,
    private personOfInterestService: PersonOfInterestService,
    private connection: Connection,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => String)
  test(@GqlUser() currentUser: CurrentUserData): string {
    try {
      ForbiddenError.from(currentUser.ability).throwUnlessCan('test', ClientEntity);

      return 'ok';
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [ClientObject])
  async getClients(@Args() args: GetClientsArgs, @GqlUser() currentUser: CurrentUserData): Promise<ClientObject[]> {
    if (currentUser.ability.cannot('readList', ClientEntity)) {
      throw new ForbiddenException();
    }

    const clientEntities = await this.clientService.getClients(
      { ...args, ...(currentUser.role !== UserRole.SUPER_ADMIN ? { userIds: [currentUser.id] } : {}) },
      this.connection.manager,
    );

    return clientEntities.map((client) => ClientService.entityToObjectMapper(client));
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => ClientObject)
  async getClient(
    @Args('id', { type: () => String }) id: string,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<ClientObject> {
    const client = await this.clientService.getClient({ id }, this.connection.manager, currentUser);

    return ClientService.entityToObjectMapper(client);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ClientObject)
  async createClient(
    @Args('createClientInput') createClientInput: CreateClientInput,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<ClientObject> {
    if (currentUser.ability.cannot('create', ClientEntity)) {
      throw new ForbiddenException();
    }

    return await this.connection.transaction(async (manager) => {
      return this.clientService.createClient(createClientInput, manager);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ClientObject)
  async updateClient(
    @Args('id', { type: () => String }) id: string,
    @Args('updateClientInput') updateClientInput: UpdateClientInput,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<ClientObject> {
    if (currentUser.ability.cannot('update', ClientEntity)) {
      throw new ForbiddenException();
    }

    return await this.connection.transaction(async (manager) => {
      return await this.clientService.updateClient(id, updateClientInput, manager);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  async deleteClient(
    @Args('id', { type: () => String }) id: string,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<string> {
    if (currentUser.ability.cannot('delete', ClientEntity)) {
      throw new ForbiddenException();
    }

    return await this.connection.transaction(async (manager) => {
      await this.clientService.deleteClient(id, manager);
      return '204 No Content';
    });
  }
}
