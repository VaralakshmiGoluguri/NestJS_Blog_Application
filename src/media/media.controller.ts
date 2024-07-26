import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { Media } from './entities/media.entity';
import { JwtAuthGuard } from 'src/users/auth.guard';
import { DeleteResult } from 'typeorm';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: CreateMediaDto })
  @ApiResponse({
    status: 201,
    description: 'Media created successfully',
    type: Media,
  })
  create(@Body() createMediaDto: CreateMediaDto): Promise<Media> {
    return this.mediaService.create(createMediaDto);
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: [CreateMediaDto] })
  @ApiResponse({
    status: 201,
    description: 'Multiple media created successfully',
    type: [Media],
  })
  createMultiple(@Body() createMediaDtos: CreateMediaDto[]): Promise<Media[]> {
    return this.mediaService.createMultiple(createMediaDtos);
  }

  @Get('blogPost/:blogPostId')
  @ApiParam({ name: 'blogPostId', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Get all media by blogPostId',
    type: [Media],
  })
  findAllByBlogPostId(
    @Param('blogPostId') blogPostId: number,
  ): Promise<Media[]> {
    return this.mediaService.findAllByBlogPostId(blogPostId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UpdateMediaDto })
  @ApiResponse({ status: 200, description: 'Update media by ID', type: Media })
  update(
    @Param('id') id: number,
    @Body() updateMediaDto: UpdateMediaDto,
  ): Promise<Media> {
    return this.mediaService.update(id, updateMediaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Delete media by ID' })
  remove(@Param('id') id: number): Promise<DeleteResult> {
    return this.mediaService.remove(id);
  }

  @Delete('blogPost/:blogPostId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'blogPostId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Delete all media by blogPostId' })
  removeAllByBlogPostId(
    @Param('blogPostId') blogPostId: number,
  ): Promise<void> {
    return this.mediaService.removeAllByBlogPostId(blogPostId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Get media by ID', type: Media })
  findOne(@Param('id') id: number): Promise<Media> {
    return this.mediaService.findOne(id);
  }
}
