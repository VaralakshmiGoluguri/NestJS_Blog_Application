import { BlogsService } from 'src/blogs/blogs.service';
import { UserService } from 'src/users/users.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { BlogPost } from 'src/blogs/entities/blog-post.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(BlogPost)
    private BlogRepository: Repository<BlogPost>,
    private blogsService: BlogsService,
  ) {}

  async createRating(
    user: User,
    blogPost: BlogPost,
    value: number,
    comment?: string,
  ) {
    const email = user.email;
    const rating = this.ratingRepository.save({
      email,
      blogPost,
      value,
      comment,
    });
    const averageRating = await this.getAverageRating(blogPost.id);
    blogPost.averageRating = parseFloat(averageRating.toFixed(2));
    this.BlogRepository.save(blogPost);
    return rating;
  }

  async getRatingsByBlogPost(blogPostId: number): Promise<Rating[]> {
    const blogPost = await this.ratingRepository.find({
      where: { blogPost: { id: blogPostId } },
    });

    if (!blogPost) {
      throw new NotFoundException(`Blog post with ID ${blogPostId} not found`);
    }

    return blogPost;
  }

  async getAverageRating(blogPostId: number): Promise<number> {
    const ratings = await this.ratingRepository.find({
      where: { blogPost: { id: blogPostId } },
    });

    const total = ratings.reduce((sum, rating) => sum + rating.value, 0);
    return ratings.length ? total / ratings.length : 0;
  }
}
