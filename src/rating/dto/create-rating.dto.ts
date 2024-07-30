import { IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({ description: 'Rating value', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  value: number;
}
