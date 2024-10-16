import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'json_column', type: 'simple-json' })
  jsonColumn: Record<string, unknown>;

  @Column({ name: 'array_column', type: 'simple-json', array: true })
  arrayColumn: Record<string, unknown>[];

  @Column({ name: 'varchar_column', type: 'varchar' })
  varcharColumn: string;

  @Column({ name: 'uuid_column', type: 'uuid' })
  uuidColumn: string;

  @Column({ name: 'boolean_column', type: 'boolean' })
  booleanColumn: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
