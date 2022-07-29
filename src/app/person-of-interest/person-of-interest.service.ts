import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { PersonOfInterestEntity } from './person-of-interest.entity';
import { PersonOfInterestObject } from './objects/person-of-interest.object';
import { CreatePersonOfInterestInput } from './input/create-person-of-interest.input';
import { UpdatePersonOfInterestInput } from './input/update-person-of-interest.input';
import { ClientEntity } from '@app/client/client.entity';
import { ValidationException } from '@app/common/exceptions/validation.exception';
import { GetPersonsOfInterestArgs } from '@app/person-of-interest/args/get-persons-of-interest.args';
import { CurrentUserData } from '@app/auth/auth.strategy';

@Injectable()
export class PersonOfInterestService {
  static entityToObjectMapper(personOfInterest: PersonOfInterestEntity): PersonOfInterestObject {
    return {
      number: personOfInterest.number,
      id: personOfInterest.id,
      name: personOfInterest.name,
      bornAt: personOfInterest.bornAt,
      notes: personOfInterest.notes,
      gender: personOfInterest.gender,
      updatedAt: personOfInterest.updatedAt,
      createdAt: personOfInterest.createdAt,
      clientId: personOfInterest.clientId,
    };
  }

  private static async validateCreatePersonOfInterest(
    args: CreatePersonOfInterestInput,
    manager: EntityManager,
  ): Promise<{
    client: ClientEntity;
  }> {
    const { clientId } = args;

    const client = await manager.findOne(ClientEntity, { id: clientId }, { relations: ['clientsUsers'] });

    if (!client) {
      throw new ValidationException({ clientId: 'Client with such id does not exist' });
    }

    return { client };
  }

  async getPersonsOfInterest(
    args: GetPersonsOfInterestArgs,
    manager: EntityManager,
  ): Promise<PersonOfInterestEntity[]> {
    const { ids, clientIds } = args;

    const queryBuilder = manager
      .getRepository(PersonOfInterestEntity)
      .createQueryBuilder('personOfInterest')
      .leftJoin('personOfInterest.client', 'client');

    if (ids && ids.length > 0) {
      queryBuilder.andWhere('personOfInterest.id IN (:...ids)', { ids });
    }

    if (clientIds && clientIds.length > 0) {
      queryBuilder.andWhere('client.id IN (:...clientIds)', { clientIds });
    }

    return await queryBuilder.getMany();
  }

  async getPersonOfInterest(
    identifier: Pick<PersonOfInterestEntity, 'id'>,
    manager: EntityManager,
    currentUser: CurrentUserData,
  ): Promise<PersonOfInterestEntity> {
    const personOfInterest = await manager.findOne<PersonOfInterestEntity>(PersonOfInterestEntity, identifier);

    if (!personOfInterest) {
      throw new NotFoundException('Person of Interest not found');
    }

    if (currentUser.ability.cannot('read', personOfInterest)) {
      throw new ForbiddenException();
    }

    return personOfInterest;
  }

  async createPersonOfInterest(
    args: CreatePersonOfInterestInput,
    manager: EntityManager,
    currentUser: CurrentUserData,
  ): Promise<PersonOfInterestEntity> {
    const { name, bornAt, notes, gender } = args;

    const { client } = await PersonOfInterestService.validateCreatePersonOfInterest(args, manager);

    if (currentUser.ability.cannot('read', client)) {
      throw new ForbiddenException();
    }

    const personOfInterestEntity = new PersonOfInterestEntity();

    personOfInterestEntity.client = client;

    if (name) {
      personOfInterestEntity.name = name;
    }

    personOfInterestEntity.bornAt = bornAt ? new Date(bornAt) : null;
    personOfInterestEntity.notes = notes;
    personOfInterestEntity.gender = gender;

    return await manager.save(PersonOfInterestEntity, personOfInterestEntity);
  }

  async updatePersonOfInterest(
    id: string,
    args: UpdatePersonOfInterestInput,
    manager: EntityManager,
    currentUser: CurrentUserData,
  ): Promise<PersonOfInterestEntity> {
    const { name, bornAt, notes, gender } = args;

    const personOfInterestEntity = await manager.findOne<PersonOfInterestEntity>(PersonOfInterestEntity, { id });

    if (!personOfInterestEntity) {
      throw new NotFoundException('Person of Interest not found');
    }

    if (currentUser.ability.cannot('update', personOfInterestEntity)) {
      throw new ForbiddenException();
    }

    if (name !== undefined) {
      personOfInterestEntity.name = name || null;
    }

    if (bornAt !== undefined) {
      personOfInterestEntity.bornAt = bornAt ? new Date(bornAt) : null;
    }

    if (notes !== undefined) {
      personOfInterestEntity.notes = notes;
    }

    if (gender !== undefined) {
      personOfInterestEntity.gender = gender;
    }

    return await manager.save(PersonOfInterestEntity, personOfInterestEntity);
  }

  async deletePersonOfInterest(id: string, manager: EntityManager, currentUser: CurrentUserData): Promise<void> {
    const personOfInterestEntity = await manager.findOne<PersonOfInterestEntity>(
      PersonOfInterestEntity,
      { id },
      { relations: ['incidents'] },
    );

    if (!personOfInterestEntity) {
      throw new NotFoundException('Person of Interest not found');
    }

    if (currentUser.ability.cannot('delete', personOfInterestEntity)) {
      throw new ForbiddenException();
    }

    await manager.softRemove(personOfInterestEntity);
    await manager.softRemove(personOfInterestEntity.incidents);
  }
}
