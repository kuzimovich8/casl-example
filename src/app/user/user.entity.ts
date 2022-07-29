import { ClientsUsersEntity } from '@app/clients-users/clients-users.entity';
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

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLIENT_ADMIN = 'CLIENT_ADMIN',
  CLIENT_WRITER = 'CLIENT_WRITER',
  CLIENT_READER = 'CLIENT_READER',
}

@Entity('User')
export class UserEntity {
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

  @Index({ unique: true, where: '"deletedAt" IS NULL' })
  @Column({ type: 'varchar', length: 32 })
  email: string;

  @Column({ type: 'varchar', length: 32 })
  firstName: string;

  @Column({ type: 'varchar', length: 32 })
  lastName: string;

  @Column({ type: 'enum', enum: UserStatus, enumName: 'UserStatus' })
  status: UserStatus;

  @Column({ type: 'enum', enum: UserRole, enumName: 'UserRole' })
  role: UserRole;

  @OneToMany(() => ClientsUsersEntity, (clientUser) => clientUser.user)
  clientsUsers: ClientsUsersEntity[];
}
