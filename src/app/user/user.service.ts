import { EntityManager, In, Not, Raw } from 'typeorm';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { GetUsersArgs } from './args/get-users.args';
import { UserObject } from './objects/user.object';
import { CreateUserInput } from './input/create-user.input';
import { UpdateUserInput } from './input/update-user.input';
import { UserEntity, UserRole, UserStatus } from '@app/user/user.entity';
import { ClientEntity } from '@app/client/client.entity';
import { ValidationException } from '@app/common/exceptions/validation.exception';
import { ClientsUsersService } from '@app/clients-users/clients-users.service';
import { ClientsUsersEntity } from '@app/clients-users/clients-users.entity';
import { CurrentUserData } from '@app/auth/auth.strategy';

@Injectable()
export class UserService {
  constructor(private readonly clientUserService: ClientsUsersService) {}

  static entityToObjectMapper(user: UserEntity): UserObject {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private static async validateCreateUser(
    input: CreateUserInput,
    manager: EntityManager,
    currentUser: CurrentUserData,
  ): Promise<{ clients: ClientEntity[] }> {
    const { clientIds, email, role } = input;

    const emailDuplicatesCount = await manager.count(UserEntity, {
      email: Raw((alias) => `LOWER(${alias}) = :value`, {
        value: email.toLowerCase(),
      }),
    });

    if (emailDuplicatesCount > 0) {
      throw new ValidationException({
        email: `User email '${email}' is already taken`,
      });
    }

    if (role !== UserRole.SUPER_ADMIN && (clientIds || []).length === 0) {
      throw new ValidationException({
        clientIds: `Add at least 1 client for such user role`,
      });
    }

    if (currentUser.role !== UserRole.SUPER_ADMIN && role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Cannot assign such role to user');
    }

    const clients = await manager.find(ClientEntity, {
      where: { id: In(clientIds || []) },
      relations: ['clientsUsers'],
    });

    if ((clientIds || []).length !== clients.length) {
      throw new ValidationException({
        clientIds: 'Client with such id does not exist',
      });
    }

    return { clients };
  }

  private static async validateUpdateUserInput(
    partialUserEntity: Pick<UserEntity, 'id' | 'role'>,
    input: UpdateUserInput,
    manager: EntityManager,
    currentUser: CurrentUserData,
  ): Promise<{ clients?: ClientEntity[] }> {
    const { email, role, clientIds } = input;

    if (email) {
      const emailDuplicatesCount = await manager.count(UserEntity, {
        email: Raw((alias) => `LOWER(${alias}) = :value`, {
          value: email.toLowerCase(),
        }),
        id: Not(partialUserEntity.id),
      });

      if (emailDuplicatesCount > 0) {
        throw new ValidationException({ email: `User email '${email}' is already taken` });
      }
    }

    if (role && role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Cannot assign such role to user');
    }

    let clients: ClientEntity[] = null;

    if (clientIds) {
      if ((role || partialUserEntity.role) !== UserRole.SUPER_ADMIN && clientIds.length === 0) {
        throw new ValidationException({
          clientIds: `Add at least 1 client for such user role`,
        });
      }

      const clients = await manager.find(ClientEntity, {
        where: { id: In(clientIds || []) },
        relations: ['clientsUsers'],
      });

      if (clientIds.length !== clients.length) {
        throw new ValidationException({
          clientIds: 'Client with such id does not exist',
        });
      }
    }

    return { clients };
  }

  async getUsers(args: GetUsersArgs, manager: EntityManager): Promise<UserEntity[]> {
    const { ids, withClientIds } = args;

    const queryBuilder = manager.getRepository(UserEntity).createQueryBuilder('user');

    if (ids && ids.length > 0) {
      queryBuilder.andWhere('user.id IN (:...ids)', { ids });
    }

    if (withClientIds && withClientIds.length > 0) {
      queryBuilder.andWhere((qb) => {
        const allClientsCount = qb
          .subQuery()
          .select('COUNT(clientsUser.id)')
          .from(ClientsUsersEntity, 'clientsUser')
          .where(`clientsUser.userId = user.id`);

        const searchedClientsCount = allClientsCount.clone().andWhere('clientsUser.clientId IN (:...withClientIds)', {
          withClientIds,
        });

        return `${allClientsCount.getQuery()} > 0 AND ${allClientsCount.getQuery()} = ${searchedClientsCount.getQuery()}`;
      });
    }

    return queryBuilder.getMany();
  }

  async getUser(
    identifier: Pick<UserEntity, 'id'>,
    manager: EntityManager,
    currentUser: CurrentUserData,
  ): Promise<UserEntity> {
    const user = await manager.findOne<UserEntity>(UserEntity, identifier, { relations: ['clientsUsers'] });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.ability.cannot('read', user)) {
      throw new ForbiddenException();
    }

    return user;
  }

  async createUser(input: CreateUserInput, manager: EntityManager, currentUser: CurrentUserData): Promise<UserEntity> {
    const { firstName, lastName, email, role } = input;

    const { clients } = await UserService.validateCreateUser(input, manager, currentUser);

    for (const client of clients) {
      if (currentUser.ability.cannot('read', client)) {
        throw new ForbiddenException();
      }
    }

    const user = new UserEntity();

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.role = role;
    user.status = UserStatus.ACTIVE;

    const insertedUserEntity = await manager.save(UserEntity, user);

    for (const client of clients) {
      await this.clientUserService.createClientUser(client, user, manager);
    }

    return insertedUserEntity;
  }

  async updateUser(
    id: string,
    args: UpdateUserInput,
    manager: EntityManager,
    currentUser: CurrentUserData,
  ): Promise<UserEntity> {
    const { firstName, lastName, email, role } = args;

    const user = await manager.findOne<UserEntity>(
      UserEntity,
      { id },
      { relations: ['clientsUsers', 'clientsUsers.client'] },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.ability.cannot('update', user)) {
      throw new ForbiddenException();
    }

    const { clients } = await UserService.validateUpdateUserInput(user, args, manager, currentUser);

    const updatedUser = await manager.save(UserEntity, {
      ...user,
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(email ? { email } : {}),
      ...(role ? { role } : {}),
    });

    if (clients) {
      for (const client of clients) {
        if (currentUser.ability.cannot('read', client)) {
          throw new ForbiddenException();
        }
      }

      const clientsUsersToDelete = user.clientsUsers.filter(
        (clientUser) => !clients.map((client) => client.id).includes(clientUser.client.id),
      );

      for (const clientsUser of clientsUsersToDelete) {
        await this.clientUserService.deleteClientUser(clientsUser.id, manager);
      }

      const clientsToCreate = clients.filter(
        (client) => !user.clientsUsers.map((clientUser) => clientUser.client.id).includes(client.id),
      );

      for (const client of clientsToCreate) {
        await this.clientUserService.createClientUser(client, user, manager);
      }
    }

    return updatedUser;
  }

  async deleteUser(id: string, manager: EntityManager, currentUser: CurrentUserData): Promise<void> {
    const user = await manager.findOne<UserEntity>(UserEntity, { id }, { relations: ['clientsUsers'] });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.ability.cannot('delete', user)) {
      throw new ForbiddenException();
    }

    await manager.remove(user.clientsUsers);
    await manager.softRemove(user);
  }

  async deactivateUser(id: string, manager: EntityManager, currentUser: CurrentUserData): Promise<UserEntity> {
    const user = await manager.findOne<UserEntity>(UserEntity, { id }, { relations: ['clientsUsers'] });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.ability.cannot('update', user)) {
      throw new ForbiddenException();
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new BadRequestException('You can not deactivate inactive user');
    }

    await manager.save(UserEntity, { ...user, status: UserStatus.INACTIVE });

    return user;
  }

  async activateUser(id: string, manager: EntityManager, currentUser: CurrentUserData): Promise<UserEntity> {
    const user = await manager.findOne<UserEntity>(UserEntity, { id }, { relations: ['clientsUsers'] });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.ability.cannot('update', user)) {
      throw new ForbiddenException();
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException('You can not activate active user');
    }

    await manager.save(UserEntity, { ...user, status: UserStatus.ACTIVE });

    return user;
  }
}
