import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { IncidentEntity } from '@app/incident/incident.entity';
import { IncidentObject } from '@app/incident/objects/incident.object';
import { GetIncidentsArgs } from '@app/incident/args/get-incidents.args';
import { ValidationException } from '@app/common/exceptions/validation.exception';
import { CreateIncidentInput } from '@app/incident/input/create-incident.input';
import { PersonOfInterestEntity } from '@app/person-of-interest/person-of-interest.entity';
import { UpdateIncidentInput } from '@app/incident/input/update-incident.input';
import { CurrentUserData } from '@app/auth/auth.strategy';

@Injectable()
export class IncidentService {
  static entityToObjectMapper(incident: IncidentEntity): IncidentObject {
    return {
      number: incident.number,
      id: incident.id,
      observedAt: incident.observedAt ? new Date(incident.observedAt) : null,
      notes: incident.notes,
      updatedAt: incident.updatedAt,
      createdAt: incident.createdAt,
      personOfInterestId: incident.personOfInterestId,
    };
  }

  private static async validateCreateIncident(
    args: CreateIncidentInput,
    manager: EntityManager,
  ): Promise<{
    personOfInterest: PersonOfInterestEntity;
  }> {
    const personOfInterest = await manager.findOne(PersonOfInterestEntity, { id: args.personOfInterestId });

    if (!personOfInterest) {
      throw new ValidationException({
        personOfInterestId: 'Person of interest with such id does not exist',
      });
    }

    return { personOfInterest };
  }

  async getIncidents(args: GetIncidentsArgs, manager: EntityManager): Promise<IncidentEntity[]> {
    const { ids, personOfInterestIds, clientIds } = args;

    const queryBuilder = manager
      .getRepository(IncidentEntity)
      .createQueryBuilder('incident')
      .leftJoin('incident.personOfInterest', 'personOfInterest')
      .leftJoin('personOfInterest.client', 'client');

    if (ids && ids.length > 0) {
      queryBuilder.andWhere('incident.id IN (:...ids)', { ids });
    }

    if (personOfInterestIds && personOfInterestIds.length > 0) {
      queryBuilder.andWhere('personOfInterest.id IN (:...personOfInterestIds)', { personOfInterestIds });
    }

    if (clientIds && clientIds.length > 0) {
      queryBuilder.andWhere('client.id IN (:...clientIds)', { clientIds });
    }

    return await queryBuilder.getMany();
  }

  async createIncident(
    args: CreateIncidentInput,
    manager: EntityManager,
    currentUser: CurrentUserData,
  ): Promise<IncidentEntity> {
    const { observedAt, notes } = args;

    const { personOfInterest } = await IncidentService.validateCreateIncident(args, manager);

    if (currentUser.ability.cannot('read', personOfInterest)) {
      throw new ForbiddenException();
    }

    const incidentEntity = new IncidentEntity();

    incidentEntity.observedAt = new Date(observedAt);
    incidentEntity.personOfInterest = personOfInterest;

    if (notes !== undefined) {
      incidentEntity.notes = notes;
    }

    return await manager.save(IncidentEntity, incidentEntity);
  }

  async getIncident(id: string, manager: EntityManager, currentUser: CurrentUserData): Promise<IncidentEntity> {
    const incident = await manager.findOne<IncidentEntity>(IncidentEntity, { id }, { relations: ['personOfInterest'] });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    if (currentUser.ability.cannot('read', incident)) {
      throw new ForbiddenException();
    }

    return incident;
  }

  async updateIncident(
    id: string,
    args: UpdateIncidentInput,
    manager: EntityManager,
    currentUser: CurrentUserData,
  ): Promise<IncidentEntity> {
    const { observedAt, notes } = args;

    const incident = await manager.findOne<IncidentEntity>(IncidentEntity, { id }, { relations: ['personOfInterest'] });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    if (currentUser.ability.cannot('update', incident)) {
      throw new ForbiddenException();
    }

    if (observedAt !== undefined) {
      incident.observedAt = new Date(observedAt);
    }

    if (notes !== undefined) {
      incident.notes = notes;
    }

    return await manager.save(IncidentEntity, incident);
  }

  async deleteIncident(id: string, manager: EntityManager, currentUser: CurrentUserData): Promise<void> {
    const incident = await manager.findOne<IncidentEntity>(IncidentEntity, { id }, { relations: ['personOfInterest'] });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    if (currentUser.ability.cannot('delete', incident)) {
      throw new ForbiddenException();
    }

    await manager.softRemove(incident);
  }
}
