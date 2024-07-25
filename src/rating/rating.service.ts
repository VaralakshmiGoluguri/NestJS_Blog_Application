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
    private userService: UserService,
  ) {}

  async createRating(
    user: User,
    blogPost: BlogPost,
    value: number,
    comment?: string,
  ) {
    // const rating = this.ratingRepository.create({
    //   user,
    //   blogPost,
    //   value,
    //   comment,
    // });
    console.log('hello', user, blogPost, value, comment);
    return this.ratingRepository.save({
      user,
      blogPost,
      value,
      comment,
    });
  }

  async getRatingsByBlogPost(blogPostId: number): Promise<Rating[]> {
    const blogPost = await this.ratingRepository.find({
      where: { blogPost: { id: blogPostId } },
      relations: ['user'],
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
