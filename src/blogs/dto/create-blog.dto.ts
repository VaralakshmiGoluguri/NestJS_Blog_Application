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
  @ApiProperty({ description: 'Url of the media' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Type of the media(audio,video,image)' })
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

  @ApiProperty({
    description: 'Array of media URLs related to the blog post',
    nullable: true,
  })
  @IsArray()
  @IsOptional()
  mediaUrls?: MediaUrlDto[];
}

export { MediaUrlDto };
