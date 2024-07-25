import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Name of the commenter' })
  name: string;

  @ApiProperty({ description: 'Content of the comment' })
  content: string;
}
