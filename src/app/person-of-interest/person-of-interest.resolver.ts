import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Connection } from 'typeorm';
import { PersonOfInterestObject } from './objects/person-of-interest.object';
import { PersonOfInterestService } from './person-of-interest.service';
import { PersonOfInterestEntity } from './person-of-interest.entity';
import { UpdatePersonOfInterestInput } from './input/update-person-of-interest.input';
import { CreatePersonOfInterestInput } from './input/create-person-of-interest.input';
import { GetPersonsOfInterestArgs } from '@app/person-of-interest/args/get-persons-of-interest.args';
import { GqlUser } from '@app/common/decorators/gql-user.decorator';
import { GqlAuthGuard } from '@app/common/guards/gql-auth.guard';
import { CurrentUserData } from '@app/auth/auth.strategy';
import { UserRole } from '@app/user/user.entity';

@Resolver(PersonOfInterestObject)
export class PersonOfInterestResolver {
  constructor(
    private readonly personOfInterestService: PersonOfInterestService,
    private readonly connection: Connection,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [PersonOfInterestObject])
  async getPersonsOfInterest(
    @Args() args: GetPersonsOfInterestArgs,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<PersonOfInterestObject[]> {
    if (currentUser.ability.cannot('readList', PersonOfInterestEntity)) {
      throw new ForbiddenException();
    }

    const personOfInterestEntities = await this.personOfInterestService.getPersonsOfInterest(
      { ...args, ...(currentUser.role !== UserRole.SUPER_ADMIN ? { clientIds: currentUser.clientIds } : {}) },
      this.connection.manager,
    );

    return personOfInterestEntities.map((personOfInterest) =>
      PersonOfInterestService.entityToObjectMapper(personOfInterest),
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => PersonOfInterestObject)
  async getPersonOfInterest(
    @Args('id', { type: () => String }) id: string,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<PersonOfInterestObject> {
    const personOfInterest = await this.personOfInterestService.getPersonOfInterest(
      { id },
      this.connection.manager,
      currentUser,
    );

    return PersonOfInterestService.entityToObjectMapper(personOfInterest);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PersonOfInterestObject)
  async createPersonOfInterest(
    @Args('createPersonOfInterestInput')
    createPersonOfInterestInput: CreatePersonOfInterestInput,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<PersonOfInterestObject> {
    if (currentUser.ability.cannot('create', PersonOfInterestEntity)) {
      throw new ForbiddenException();
    }

    return await this.connection.transaction(async (manager) => {
      const personOfInterestEntity = await this.personOfInterestService.createPersonOfInterest(
        createPersonOfInterestInput,
        manager,
        currentUser,
      );
      return PersonOfInterestService.entityToObjectMapper(personOfInterestEntity);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PersonOfInterestObject)
  async updatePersonOfInterest(
    @Args('id', { type: () => String }) id: string,
    @Args('updatePersonOfInterestInput')
    updatePersonOfInterestInput: UpdatePersonOfInterestInput,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<PersonOfInterestObject> {
    if (currentUser.ability.cannot('update', PersonOfInterestEntity)) {
      throw new ForbiddenException();
    }

    return await this.connection.transaction(async (manager) => {
      const personOfInterestEntity = await this.personOfInterestService.updatePersonOfInterest(
        id,
        updatePersonOfInterestInput,
        manager,
        currentUser,
      );
      return PersonOfInterestService.entityToObjectMapper(personOfInterestEntity);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  async deletePersonOfInterest(
    @Args('id', { type: () => String }) id: string,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<string> {
    if (currentUser.ability.cannot('delete', PersonOfInterestEntity)) {
      throw new ForbiddenException();
    }

    return await this.connection.transaction(async (manager) => {
      await this.personOfInterestService.deletePersonOfInterest(id, manager, currentUser);
      return '204 No Content';
    });
  }
}
