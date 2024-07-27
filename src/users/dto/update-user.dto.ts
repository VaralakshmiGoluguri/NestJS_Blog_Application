
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'username',
    description: 'Name of the user',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'Password to update',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;
}
