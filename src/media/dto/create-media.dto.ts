import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MediaType } from '../media-type.enum';

export class CreateMediaDto {
  @ApiProperty({ description: 'URL of the media' })
  url: string;

  @IsEnum(MediaType)
  @IsNotEmpty()
  @ApiProperty({ description: 'Type of the media', enum: MediaType })
  type: MediaType;

  @ApiProperty({ description: 'Blog post ID' })
  blogPostId: number;
}
