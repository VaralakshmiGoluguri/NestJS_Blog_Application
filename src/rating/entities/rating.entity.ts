import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { BlogPost } from 'src/blogs/entities/blog-post.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  value: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column()
  email: string;

  @ManyToOne(() => BlogPost, (blogPost) => blogPost.ratings)
  @JoinColumn({ name: 'blog_post_id' })
  blogPost: BlogPost;
}
