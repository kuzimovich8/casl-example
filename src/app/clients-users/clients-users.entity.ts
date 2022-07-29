import { ClientEntity } from '@app/client/client.entity';
import { UserEntity } from '@app/user/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ClientsUsers')
export class ClientsUsersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  /*========================================================================*/

  @Column()
  readonly userId: string;

  @ManyToOne(() => UserEntity, (user) => user.clientsUsers, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  user: UserEntity;

  @Column()
  readonly clientId: string;

  @ManyToOne(() => ClientEntity, (client) => client.clientsUsers, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  client: ClientEntity;
}
