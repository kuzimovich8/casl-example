import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '@app/user/user.entity';

@Entity('Auth')
export class AuthEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date;

  /*========================================================================*/

  @Column({ type: 'varchar', length: 256 })
  token: string;

  @Column()
  readonly userId: string;

  @ManyToOne(() => UserEntity)
  user: UserEntity;
}
