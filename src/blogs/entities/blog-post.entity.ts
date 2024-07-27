import { ApiProperty } from '@nestjs/swagger';
import { Rating } from 'src/rating/entities/rating.entity';
import { User } from 'src/users/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { MediaType } from '../media-type.enum';

@Entity()
export class BlogPost {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier of the blog post' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'Title of the blog post' })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'Brief description of the blog post' })
  brief: string;

  @Column('text')
  @ApiProperty({ description: 'Content of the blog post' })
  content: string;

  // @Column('simple-array', { nullable: true })
  // @ApiProperty({
  //   description: 'Array of media URLs related to the blog post',
  //   type: [String],
  //   nullable: true,
  // })
  // mediaUrls: string[];

  @Column('json', { nullable: true })
  @ApiProperty({
    description: 'Array of media URLs related to the blog post',
    nullable: true,
  })
  mediaUrls: { url: string; type: MediaType }[];

  @Column('float', { default: 0 })
  @ApiProperty({ description: 'Average rating of the blog post', default: 0 })
  averageRating: number;

  @ManyToOne(() => User, (user) => user.blogPosts, { onDelete: 'CASCADE' })
  @ApiProperty({ description: 'User who created the blog post' })
  user: User;

  @Column()
  @ApiProperty({ description: 'ID of the user who created the blog post' })
  userId: number;

  @OneToMany(() => Rating, (rating) => rating.blogPost, { cascade: true })
  @ApiProperty({ description: 'Ratings for the blog post' })
  ratings: Rating[];

  @OneToMany(() => Comment, (comment) => comment.blogPost)
  @ApiProperty({ description: 'Comments for the blog post' })
  comments: Comment[];

}
