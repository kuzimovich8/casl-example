import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { UserEntity, UserRole, UserStatus } from '@app/user/user.entity';
import { ClientEntity, ClientStatus } from '@app/client/client.entity';
import { PersonOfInterestEntity } from '@app/person-of-interest/person-of-interest.entity';
import { IncidentEntity } from '@app/incident/incident.entity';
import { users } from '@app/seed/data/users';
import { clients } from '@app/seed/data/clients';
import { personsOfInterest } from '@app/seed/data/persons-of-interest';
import { incidents } from '@app/seed/data/incidents';
import { ClientsUsersEntity } from '@app/clients-users/clients-users.entity';

@Injectable()
export class SeedService {
  constructor(private readonly connection: Connection) {}

  async seedDatabaseAction() {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const insertedUsers = await queryRunner.manager.save(
        UserEntity,
        users.map((user) => ({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          status: UserStatus.ACTIVE,
          role: UserRole.SUPER_ADMIN,
        })),
      );

      const insertedClients = await queryRunner.manager.save(
        ClientEntity,
        clients.map((client) => ({
          name: client.name,
          status: ClientStatus.ACTIVE,
        })),
      );

      await queryRunner.manager.save(
        ClientsUsersEntity,
        insertedClients.map((client) => ({
          client,
          user: insertedUsers[Math.floor(Math.random() * insertedUsers.length)],
        })),
      );

      const insertedPersonsOfInterest = await queryRunner.manager.save(
        PersonOfInterestEntity,
        personsOfInterest.map((personOfInterest) => ({
          ...personOfInterest,
          client: insertedClients[Math.floor(Math.random() * insertedClients.length)],
        })),
      );

      await queryRunner.manager.save(
        IncidentEntity,
        incidents.map((incident) => {
          const personOfInterest =
            insertedPersonsOfInterest[Math.floor(Math.random() * insertedPersonsOfInterest.length)];

          return {
            observedAt: new Date(incident.observedAt),
            notes: incident.notes,
            personOfInterest,
          };
        }),
      );

      console.log('done!');

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.log(err);
    } finally {
      await queryRunner.release();
    }
  }
}
