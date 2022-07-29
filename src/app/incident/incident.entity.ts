import { PersonOfInterestEntity } from '@app/person-of-interest/person-of-interest.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Incident')
export class IncidentEntity {
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
  @Column({ type: 'timestamptz', nullable: true })
  observedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Index()
  @Column()
  readonly personOfInterestId: string;

  @ManyToOne(() => PersonOfInterestEntity, (personOfInterest) => personOfInterest.incidents, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  personOfInterest: PersonOfInterestEntity;
}
