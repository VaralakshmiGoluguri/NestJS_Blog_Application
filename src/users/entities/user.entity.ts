import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @IsNotEmpty()
  password: string;

  @Column({ nullable: true })
  twoFactorSecret: string;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;
}
