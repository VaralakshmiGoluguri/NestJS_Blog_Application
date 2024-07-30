import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { BlogPost } from '../../blogs/entities/blog-post.entity';
import { ApiProperty } from '@nestjs/swagger';
@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier of the comment' })
  id: number;

  @Column()
  @ApiProperty({ description: 'User email who has commented on the post' })
  email: string;

  @Column()
  @ApiProperty({ description: 'User name who has commented on the post' })
  name: string;

  @Column('text')
  @ApiProperty({ description: 'Comment on the post' })
  content: string;

  @ManyToOne(() => BlogPost, (blogPost) => blogPost.comments, {
    onDelete: 'CASCADE',
  })
  @ApiProperty({ description: 'Blog Post to which user has commented' })
  blogPost: BlogPost;
  @Column()
  @ApiProperty({ description: 'Blog Post Id to which user has commented' })
  blogPostId: number;
}
