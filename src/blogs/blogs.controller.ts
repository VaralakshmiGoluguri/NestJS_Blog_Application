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
import { JwtAuthGuard } from '../users/auth.guard';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a Blog post' })
  @ApiResponse({
    status: 201,
    description: 'The blog post has been successfully created.',
    type: BlogPost,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(
    @Body() createBlogDto: CreateBlogPostDto,
    @Req() request,
  ): Promise<BlogPost> {
    return await this.blogsService.create(createBlogDto, request.user.userId);
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Multiple Blog posts' })
  @ApiResponse({
    status: 201,
    description: 'The blog posts have been successfully created.',
    type: [BlogPost],
  })
  @ApiBody({ type: [CreateBlogPostDto] })
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
  @ApiOperation({ summary: 'Get all the Blog posts' })
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
  @ApiOperation({ summary: 'Get Blog post based on id' })
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
    const blogPost = await this.blogsService.findById(id);
    if (!blogPost) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
    return blogPost;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a Blog post' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the blog post to update',
    type: Number,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'The blog post has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  @ApiBody({ type: CreateBlogPostDto })
  async updateBlogPost(
    @Param('id') id: number,
    @Body() updateBlogPostDto: Partial<CreateBlogPostDto>,
    @Req() req,
  ): Promise<{ statusCode: number; message: string }> {
    return await this.blogsService.updateBlogPost(
      id,
      updateBlogPostDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Blog Post' })
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
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async deleteBlogPost(
    @Param('id') id: number,
    @Req() req,
  ): Promise<{ statusCode: number; message: string }> {
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
    const userId = req.user.userId;
    return await this.blogsService.deleteAllByUser(userId);
  }
}
