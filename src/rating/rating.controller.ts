import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Req,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { User } from 'src/users/entities/user.entity';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/users/auth.guard';
import { BlogsService } from 'src/blogs/blogs.service';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingController {
  constructor(
    private readonly ratingService: RatingService,
    private readonly blogsService: BlogsService,
  ) {}

  @Post(':blogPostId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a rating for a blog post' })
  @ApiResponse({ status: 201, description: 'Rating created successfully' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createRating(
    @Req() req,
    @Param('blogPostId') blogPostId: number,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    const user = req.user;
    const blogPost = await this.blogsService.findById(blogPostId);

    if (!blogPost) {
      throw new NotFoundException(`Blog post with ID ${blogPostId} not found`);
    }

    return this.ratingService.createRating(
      user,
      blogPost,
      createRatingDto.value,
      createRatingDto.comment,
    );
  }

  @Get(':blogPostId')
  @ApiOperation({ summary: 'Get all ratings for a blog post' })
  @ApiResponse({ status: 200, description: 'List of ratings' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async getRatingsByBlogPost(@Param('blogPostId') blogPostId: number) {
    return this.ratingService.getRatingsByBlogPost(blogPostId);
  }

  @Get(':blogPostId/average')
  @ApiOperation({ summary: 'Get average rating for a blog post' })
  @ApiResponse({ status: 200, description: 'Average rating' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async getAverageRating(@Param('blogPostId') blogPostId: number) {
    return {
      averageRating: await this.ratingService.getAverageRating(blogPostId),
    };
  }
}
