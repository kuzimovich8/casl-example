import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Connection } from 'typeorm';
import { UserObject } from './objects/user.object';
import { UserService } from './user.service';
import { GetUsersArgs } from './args/get-users.args';
import { CreateUserInput } from './input/create-user.input';
import { UpdateUserInput } from './input/update-user.input';
import { ClientService } from '@app/client/client.service';
import { CurrentUserData } from '@app/auth/auth.strategy';
import { GqlAuthGuard } from '@app/common/guards/gql-auth.guard';
import { GqlUser } from '@app/common/decorators/gql-user.decorator';
import { UserEntity, UserRole } from '@app/user/user.entity';
import { ClientObject } from '@app/client/objects/client.object';

@Resolver(UserObject)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly connection: Connection,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [UserObject])
  async getUsers(@Args() args: GetUsersArgs, @GqlUser() currentUser: CurrentUserData): Promise<UserObject[]> {
    if (currentUser.ability.cannot('readList', UserEntity)) {
      throw new ForbiddenException();
    }

    const userEntities = await this.userService.getUsers(
      { ...args, ...(currentUser.role !== UserRole.SUPER_ADMIN ? { withClientIds: currentUser.clientIds } : {}) },
      this.connection.manager,
    );

    return userEntities.map((user) => UserService.entityToObjectMapper(user));
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserObject)
  async getUser(
    @Args('id', { type: () => String }) id: string,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<UserObject> {
    if (currentUser.ability.cannot('read', UserEntity)) {
      throw new ForbiddenException();
    }

    const userEntity = await this.userService.getUser({ id }, this.connection.manager, currentUser);

    return UserService.entityToObjectMapper(userEntity);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserObject)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<UserObject> {
    if (currentUser.ability.cannot('create', UserEntity)) {
      throw new ForbiddenException();
    }

    return await this.connection.transaction(async (manager) => {
      const userEntity = await this.userService.createUser(createUserInput, manager, currentUser);
      return UserService.entityToObjectMapper(userEntity);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserObject)
  async updateUser(
    @Args('id', { type: () => String }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<UserObject> {
    if (currentUser.ability.cannot('update', UserEntity)) {
      throw new ForbiddenException();
    }

    return await this.connection.transaction(async (manager) => {
      const userEntity = await this.userService.updateUser(id, updateUserInput, manager, currentUser);
      return UserService.entityToObjectMapper(userEntity);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  async deleteUser(
    @Args('id', { type: () => String }) id: string,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<string> {
    if (currentUser.ability.cannot('delete', UserEntity)) {
      throw new ForbiddenException();
    }

    return await this.connection.transaction(async (manager) => {
      await this.userService.deleteUser(id, manager, currentUser);
      return '204 No Content';
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserObject)
  async deactivateUser(
    @Args('id', { type: () => String }) id: string,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<UserObject> {
    if (currentUser.ability.cannot('update', UserEntity)) {
      throw new ForbiddenException();
    }

    return await this.connection.transaction(async (manager) => {
      const userEntity = await this.userService.deactivateUser(id, manager, currentUser);
      return UserService.entityToObjectMapper(userEntity);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserObject)
  async activateUser(
    @Args('id', { type: () => String }) id: string,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<UserObject> {
    if (currentUser.ability.cannot('update', UserEntity)) {
      throw new ForbiddenException();
    }

    return await this.connection.transaction(async (manager) => {
      const userEntity = await this.userService.activateUser(id, manager, currentUser);
      return UserService.entityToObjectMapper(userEntity);
    });
  }

  @ResolveField('fullName', () => String)
  fullName(@Parent() userObject: UserObject): string {
    return [userObject.firstName, userObject.lastName].filter((item) => !!item).join(' ');
  }

  @ResolveField('clients', () => [ClientObject])
  async clients(@Parent() user: UserObject): Promise<ClientObject[]> {
    const clientEntities = await this.clientService.getClients({ userIds: [user.id] }, this.connection.manager);
    return clientEntities.map((item) => ClientService.entityToObjectMapper(item));
  }
}
