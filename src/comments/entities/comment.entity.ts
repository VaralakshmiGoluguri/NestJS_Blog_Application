import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { BlogPost } from 'src/blogs/entities/blog-post.entity';
@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column('text')
  content: string;

  @ManyToOne(() => BlogPost, (blogPost) => blogPost.comments)
  blogPost: BlogPost;
  @Column()
  blogPostId: number;
}
