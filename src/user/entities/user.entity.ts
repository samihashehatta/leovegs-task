import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { UserRole } from '../enums/role.enum';

@Entity({ name: 'user' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column('varchar', { length: 255, name: 'name' })
  name: string;

  @Column('varchar', { length: 255, name: 'email' })
  email: string;

  @Column('varchar', { length: 255, name: 'password' })
  @Exclude()
  password: string;

  @Column('simple-enum', { enum: UserRole, default: 'USER' })
  role: UserRole;

  @Column('text', { name: 'access_token', nullable: true })
  accessToken: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;
}
