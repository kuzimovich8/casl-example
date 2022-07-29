import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AuthEntity } from '@app/auth/auth.entity';
import { UserEntity } from '@app/user/user.entity';
import { ClientsUsersEntity } from '@app/clients-users/clients-users.entity';

@Injectable()
export class AuthService {
  async getAuth(token: string, manager: EntityManager): Promise<AuthEntity> {
    return await manager.findOne(AuthEntity, { token });
  }

  async getUser(id: string, manager: EntityManager): Promise<UserEntity & { clientsUsers: ClientsUsersEntity[] }> {
    return await manager.findOne(UserEntity, { id }, { relations: ['clientsUsers'] });
  }
}
