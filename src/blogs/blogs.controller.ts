import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogPostDto } from './dto/create-blog.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BlogPost } from './entities/blog-post.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { JwtAuthGuard } from 'src/users/auth.guard';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: 'The blog post has been successfully created.',
    type: BlogPost,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createBlogDto: CreateBlogPostDto, @Req() request) {
    return await this.blogsService.create(createBlogDto, request.user.userId);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: 'The blog posts have been successfully created.',
    type: [BlogPost],
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async createBlogPosts(
    @Body() createBlogPostsDto: CreateBlogPostDto[],
    @Req() req,
  ): Promise<BlogPost[]> {
    return await this.blogsService.createMultiple(
      createBlogPostsDto,
      req.user.userId,
    );
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'The blog post has been successfully updated.',
    type: UpdateResult,
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async updateBlogPost(
    @Param('id') id: number,
    @Body() updateBlogPostDto: Partial<CreateBlogPostDto>,
    @Req() req,
  ): Promise<UpdateResult> {
    return await this.blogsService.updateBlogPost(
      id,
      updateBlogPostDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'The ID of the blog post to delete',
    type: Number,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'The blog post has been successfully deleted.',
    type: DeleteResult,
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async deleteBlogPost(
    @Param('id') id: number,
    @Req() req,
  ): Promise<DeleteResult> {
    return await this.blogsService.deleteBlogPost(id, req.user.userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all blog posts for a user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved blog posts',
    type: [BlogPost],
  })
  @ApiResponse({ status: 404, description: 'User or blog posts not found' })
  async findAllByUser(@Param('userId') userId: number): Promise<BlogPost[]> {
    try {
      return await this.blogsService.findAllByUser(userId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Delete('user/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete all blog posts of the logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'All blog posts deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async deleteAllByUser(
    @Req() req,
  ): Promise<{ statusCode: number; message: string }> {
    const userId = req.user.id;
    return await this.blogsService.deleteAllByUser(userId);
  }
}
