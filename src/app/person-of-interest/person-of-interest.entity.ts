import { ClientEntity } from '@app/client/client.entity';
import { IncidentEntity } from '@app/incident/incident.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PersonOfInterestGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

@Entity('PersonOfInterest')
export class PersonOfInterestEntity {
  @Generated('increment')
  @Column({ type: 'integer' })
  number: number;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date;

  @Index()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  /*========================================================================*/

  @Index()
  @Column({ type: 'varchar', length: 128, nullable: true })
  name: string;

  @Column({ type: 'date', nullable: true })
  bornAt: Date;

  @Column({ type: 'enum', enum: PersonOfInterestGender, enumName: 'PersonOfInterestGender', nullable: true })
  gender: PersonOfInterestGender;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Index()
  @Column()
  readonly clientId: string;

  @ManyToOne(() => ClientEntity, (client) => client.personsOfInterest, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  client: ClientEntity;

  @OneToMany(() => IncidentEntity, (incident) => incident.personOfInterest)
  incidents: IncidentEntity[];
}
