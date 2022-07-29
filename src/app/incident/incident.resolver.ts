import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Connection } from 'typeorm';
import { IncidentService } from '@app/incident/incident.service';
import { IncidentObject } from '@app/incident/objects/incident.object';
import { GetIncidentsArgs } from '@app/incident/args/get-incidents.args';
import { CreateIncidentInput } from '@app/incident/input/create-incident.input';
import { IncidentEntity } from '@app/incident/incident.entity';
import { UpdateIncidentInput } from '@app/incident/input/update-incident.input';
import { GqlAuthGuard } from '@app/common/guards/gql-auth.guard';
import { GqlUser } from '@app/common/decorators/gql-user.decorator';
import { CurrentUserData } from '@app/auth/auth.strategy';
import { UserRole } from '@app/user/user.entity';

@Resolver(IncidentObject)
export class IncidentResolver {
  constructor(private readonly incidentService: IncidentService, private readonly connection: Connection) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [IncidentObject])
  async getIncidents(
    @Args() args: GetIncidentsArgs,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<IncidentObject[]> {
    if (currentUser.ability.cannot('readList', IncidentEntity)) {
      throw new ForbiddenException();
    }

    const incidentEntities = await this.incidentService.getIncidents(
      { ...args, ...(currentUser.role !== UserRole.SUPER_ADMIN ? { clientIds: currentUser.clientIds } : {}) },
      this.connection.manager,
    );

    return incidentEntities.map((incident) => IncidentService.entityToObjectMapper(incident));
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => IncidentObject)
  async getIncident(
    @Args('id', { type: () => String }) id: string,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<IncidentObject> {
    const incident = await this.incidentService.getIncident(id, this.connection.manager, currentUser);
    return IncidentService.entityToObjectMapper(incident);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => IncidentObject)
  async createIncident(
    @Args('createIncidentInput')
    createIncidentInput: CreateIncidentInput,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<IncidentObject> {
    if (currentUser.ability.cannot('create', IncidentEntity)) {
      throw new ForbiddenException();
    }

    return await this.connection.transaction(async (manager) => {
      const incidentEntity = await this.incidentService.createIncident(createIncidentInput, manager, currentUser);
      return IncidentService.entityToObjectMapper(incidentEntity);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => IncidentObject)
  async updateIncident(
    @Args('id', { type: () => String }) id: string,
    @Args('updateIncidentInput')
    updateIncidentInput: UpdateIncidentInput,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<IncidentObject> {
    if (currentUser.ability.cannot('update', IncidentEntity)) {
      throw new ForbiddenException();
    }

    return await this.connection.transaction(async (manager) => {
      const incidentEntity = await this.incidentService.updateIncident(id, updateIncidentInput, manager, currentUser);
      return IncidentService.entityToObjectMapper(incidentEntity);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  async deleteIncident(
    @Args('id', { type: () => String }) id: string,
    @GqlUser() currentUser: CurrentUserData,
  ): Promise<string> {
    if (currentUser.ability.cannot('delete', IncidentEntity)) {
      throw new ForbiddenException();
    }

    return await this.connection.transaction(async (manager) => {
      await this.incidentService.deleteIncident(id, manager, currentUser);
      return '204 No Content';
    });
  }
}
