import { Comment } from 'src/comments/entities/comment.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { BlogPost } from 'src/blogs/entities/blog-post.entity';
import { Rating } from 'src/rating/entities/rating.entity';

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

  @OneToMany(() => BlogPost, (blogPost) => blogPost.userId)
  blogPosts: BlogPost[];

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[];
}
