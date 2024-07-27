import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { MediaType } from '../media-type.enum';

class MediaUrlDto {
  @IsString()
  url: string;

  @IsEnum(MediaType)
  type: MediaType;
}
export class CreateBlogPostDto {
  @ApiProperty({ description: 'Title of the blog post' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Brief description of the blog post' })
  @IsString()
  @IsNotEmpty()
  brief: string;

  @ApiProperty({ description: 'Content of the blog post' })
  @IsString()
  @IsNotEmpty()
  content: string;

  // @ApiProperty({
  //   description: 'Array of media URLs related to the blog post',
  //   type: [String],
  //   nullable: true,
  // })
  // @IsArray()
  // @IsOptional()
  // mediaUrls?: string[];

  @ApiProperty({
    description: 'Array of media URLs related to the blog post',
    nullable: true,
  })
  @IsArray()
  @IsOptional()
  mediaUrls?: MediaUrlDto[];
  // @ApiProperty({
  //   description: 'UserId of whom the blog post belongs',
  // })
  // @IsNotEmpty()
  // @IsString()
  // userId: number;
}

export { MediaUrlDto };
