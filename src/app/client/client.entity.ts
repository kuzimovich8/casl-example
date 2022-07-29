import { ClientsUsersEntity } from '@app/clients-users/clients-users.entity';
import { PersonOfInterestEntity } from '@app/person-of-interest/person-of-interest.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('Client')
export class ClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date;

  @Index()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  /*========================================================================*/

  @Column({ type: 'enum', enum: ClientStatus, enumName: 'ClientStatus' })
  status: ClientStatus;

  @Index({ unique: true, where: '"deletedAt" IS NULL' })
  @Column({ type: 'varchar', length: '128' })
  name: string;

  @OneToMany(() => ClientsUsersEntity, (clientUser) => clientUser.client)
  clientsUsers: ClientsUsersEntity[];

  @OneToMany(() => PersonOfInterestEntity, (personOfInterest) => personOfInterest.client)
  personsOfInterest: PersonOfInterestEntity[];
}
