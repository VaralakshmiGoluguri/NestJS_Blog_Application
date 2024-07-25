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

  // @ManyToOne(() => User, (user) => user.ratings)
  // user: User;

  // @Column()
  // userId: number;

  // @ManyToOne(() => BlogPost, (blogPost) => blogPost.ratings)
  // blogPost: BlogPost;

  // @Column()
  // blogPostId: number;

  @ManyToOne(() => User, (user) => user.ratings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => BlogPost, (blogPost) => blogPost.ratings)
  @JoinColumn({ name: 'blog_post_id' })
  blogPost: BlogPost;
}
