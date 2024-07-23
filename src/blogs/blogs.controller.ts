import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogPostDto } from './dto/create-blog.dto';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BlogPost } from './entities/blog-post.entity';
import { DeleteResult, UpdateResult } from 'typeorm';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The blog post has been successfully created.',
    type: BlogPost,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createBlogDto: CreateBlogPostDto) {
    return await this.blogsService.create(createBlogDto);
  }

  @Post('multiple')
  @ApiBody({
    description: 'Array of blog posts to create',
    type: [CreateBlogPostDto],
    schema: {
      example: [
        {
          title: 'string',
          brief: 'string',
          content: 'string',
          mediaUrls: ['string'],
        },
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The blog posts have been successfully created.',
    type: [BlogPost],
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async createBlogPosts(
    @Body() createBlogPostsDto: CreateBlogPostDto[],
  ): Promise<BlogPost[]> {
    return await this.blogsService.createMultiple(createBlogPostsDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'The list of blog posts',
    type: [BlogPost],
  })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async findAll(): Promise<BlogPost[]> {
    return await this.blogsService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'The ID of the blog post to retrieve',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'The blog post with the specified ID',
    type: BlogPost,
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async findById(@Param('id') id: number): Promise<BlogPost> {
    return await this.blogsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    description: 'The ID of the blog post to update',
    type: Number,
  })
  @ApiBody({
    description: 'The blog post details to update',
    type: CreateBlogPostDto,
    schema: {
      example: {
        title: 'string',
        brief: 'string',
        content: 'string',
        mediaUrls: ['string'],
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The blog post has been successfully updated.',
    type: UpdateResult,
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async updateBlogPost(
    @Param('id') id: number,
    @Body() updateBlogPostDto: Partial<CreateBlogPostDto>,
  ): Promise<UpdateResult> {
    return await this.blogsService.updateBlogPost(id, updateBlogPostDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'The ID of the blog post to delete',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'The blog post has been successfully deleted.',
    type: DeleteResult,
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async deleteBlogPost(@Param('id') id: number): Promise<DeleteResult> {
    return await this.blogsService.deleteBlogPost(id);
  }
}
