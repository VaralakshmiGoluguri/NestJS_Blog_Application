import { ApiProperty } from '@nestjs/swagger';
import { BlogPost } from 'src/blogs/entities/blog-post.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MediaType } from '../media-type.enum';

@Entity()
export class Media {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier of the media' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'URL of the media' })
  url: string;

  @Column({ type: 'enum', enum: MediaType })
  @ApiProperty({ description: 'Type of the media', enum: MediaType })
  type: MediaType;

  @ManyToOne(() => BlogPost, (blogPost) => blogPost.media, {
    onDelete: 'CASCADE',
  })
  @ApiProperty({ description: 'Blog post associated with the media' })
  blogPost: BlogPost;

  @Column()
  @ApiProperty({ description: 'Blog post ID' })
  blogPostId: number;
}
