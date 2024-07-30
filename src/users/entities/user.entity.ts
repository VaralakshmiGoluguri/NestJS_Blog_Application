import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { BlogPost } from '../../blogs/entities/blog-post.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier of the user' })
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  @ApiProperty({ description: 'User Email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({ description: 'User Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({ description: 'User Password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @OneToMany(() => BlogPost, (blogPost) => blogPost.userId)
  @ApiProperty({ description: 'Associated Blogposts' })
  blogPosts: BlogPost[];
}
