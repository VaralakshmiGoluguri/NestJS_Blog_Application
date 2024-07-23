import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column('simple-array', { nullable: true })
  @ApiProperty({
    description: 'Array of media URLs related to the blog post',
    type: [String],
    nullable: true,
  })
  mediaUrls: string[];

  @Column('int', { default: 0 })
  @ApiProperty({ description: 'Average rating of the blog post', default: 0 })
  averageRating: number;
}
