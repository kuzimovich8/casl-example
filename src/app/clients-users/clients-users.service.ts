import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { UserEntity } from '@app/user/user.entity';
import { ClientEntity } from '@app/client/client.entity';
import { ClientsUsersEntity } from '@app/clients-users/clients-users.entity';

@Injectable()
export class ClientsUsersService {
  async createClientUser(client: ClientEntity, user: UserEntity, manager: EntityManager): Promise<ClientsUsersEntity> {
    const clientUserEntity = new ClientsUsersEntity();

    clientUserEntity.client = client;
    clientUserEntity.user = user;

    return await manager.save(ClientsUsersEntity, clientUserEntity);
  }

  async deleteClientUser(id: string, manager: EntityManager): Promise<void> {
    const clientUserEntity = await manager.findOne(ClientsUsersEntity, {
      id,
    });

    if (!clientUserEntity) {
      throw new NotFoundException('Client user entity not found');
    }

    await manager.remove(clientUserEntity);
  }
}
