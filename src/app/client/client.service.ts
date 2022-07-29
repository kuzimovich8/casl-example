import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, Not, Raw } from 'typeorm';
import { GetClientsArgs } from './args/get-clients.args';
import { ClientObject } from '@app/client/objects/client.object';
import { CreateClientInput } from '@app/client/input/create-client.input';
import { UpdateClientInput } from '@app/client/input/update-client.input';
import { ValidationException } from '@app/common/exceptions/validation.exception';
import { ClientEntity, ClientStatus } from '@app/client/client.entity';
import { CurrentUserData } from '@app/auth/auth.strategy';

@Injectable()
export class ClientService {
  static entityToObjectMapper(client: ClientEntity): ClientObject {
    return {
      id: client.id,
      name: client.name,
      status: client.status,
      createdAt: client.createdAt,
    };
  }

  private static async validateCreateClientInput(input: CreateClientInput, manager: EntityManager): Promise<void> {
    const { name } = input;

    const nameDuplicatesCount = await manager.count(ClientEntity, {
      name: Raw((alias) => `LOWER(${alias}) = :value`, {
        value: name.toLowerCase(),
      }),
    });

    if (nameDuplicatesCount > 0) {
      throw new ValidationException({ name: `Client name '${name}' is already taken` });
    }
  }

  private static async validateUpdateClientInput(
    id: string,
    input: UpdateClientInput,
    manager: EntityManager,
  ): Promise<void> {
    const { name } = input;

    if (name !== undefined) {
      const nameDuplicatesCount = await manager.count(ClientEntity, {
        name: Raw((alias) => `LOWER(${alias}) = :value`, {
          value: name.toLowerCase(),
        }),
        id: Not(id),
      });

      if (nameDuplicatesCount > 0) {
        throw new ValidationException({ name: `Client name '${name}' is already taken` });
      }
    }
  }

  async getClients(args: GetClientsArgs, manager: EntityManager): Promise<ClientEntity[]> {
    const { userIds, ids } = args;

    const queryBuilder = manager.getRepository(ClientEntity).createQueryBuilder('client');

    if (userIds) {
      queryBuilder
        .leftJoin('client.clientsUsers', 'clientsUsers')
        .andWhere('clientsUsers.userId IN (:...userIds)', { userIds });
    }

    if (ids && ids.length > 0) {
      queryBuilder.andWhere('client.id IN (:...ids)', { ids });
    }

    return await queryBuilder.getMany();
  }

  async getClient(
    identifier: Pick<ClientEntity, 'id'>,
    manager: EntityManager,
    currentUser: CurrentUserData,
  ): Promise<ClientEntity> {
    const clientEntity = await manager.findOne<ClientEntity>(ClientEntity, identifier, { relations: ['clientsUsers'] });

    if (!clientEntity) {
      throw new NotFoundException('Client not found');
    }

    if (currentUser.ability.cannot('read', clientEntity)) {
      throw new ForbiddenException();
    }

    return clientEntity;
  }

  async createClient(input: CreateClientInput, manager: EntityManager): Promise<ClientEntity> {
    const { name } = input;

    await ClientService.validateCreateClientInput(input, manager);

    const clientEntity = new ClientEntity();

    clientEntity.status = ClientStatus.ACTIVE;
    clientEntity.name = name;

    return await manager.save(ClientEntity, clientEntity);
  }

  async updateClient(id: string, input: UpdateClientInput, manager: EntityManager): Promise<ClientEntity> {
    const { name } = input;

    const clientEntity = await manager.findOne<ClientEntity>(ClientEntity, { id });

    if (!clientEntity) {
      throw new NotFoundException('Client not found');
    }

    await ClientService.validateUpdateClientInput(id, input, manager);

    return await manager.save(ClientEntity, { ...clientEntity, ...(name !== undefined ? { name } : {}) });
  }

  async deleteClient(id: string, manager: EntityManager): Promise<void> {
    const clientEntity = await manager.findOne<ClientEntity>(
      ClientEntity,
      { id },
      { relations: ['personsOfInterest', 'clientsUsers'] },
    );

    if (!clientEntity) {
      throw new NotFoundException('Client not found');
    }

    if (clientEntity.personsOfInterest.length > 0) {
      throw new BadRequestException(`Cannot delete client with POI's`);
    }

    await manager.softRemove(clientEntity);
    await manager.remove(clientEntity.clientsUsers);
  }
}
