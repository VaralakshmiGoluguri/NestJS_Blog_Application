import { Test, TestingModule } from '@nestjs/testing';
import { RatingService } from './rating.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rating } from './entities/rating.entity';
import { BlogPost } from '../blogs/entities/blog-post.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RatingService', () => {
  let service: RatingService;
  let ratingRepository: Repository<Rating>;
  let blogRepository: Repository<BlogPost>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        {
          provide: getRepositoryToken(Rating),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(BlogPost),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
    ratingRepository = module.get<Repository<Rating>>(
      getRepositoryToken(Rating),
    );
    blogRepository = module.get<Repository<BlogPost>>(
      getRepositoryToken(BlogPost),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Give Rating', () => {
    it('should create a rating', async () => {
      const user = { email: 'test@example.com' } as User;
      const blogPost = { id: 1, averageRating: 0 } as BlogPost;
      const value = 5;
      const rating: Rating = { id: 1, email: user.email, blogPost, value };

      jest.spyOn(ratingRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(ratingRepository, 'save').mockResolvedValue(rating);
      jest.spyOn(service, 'getAverageRating').mockResolvedValue(4.5);
      jest.spyOn(blogRepository, 'save').mockResolvedValue(blogPost);

      const result = await service.createRating(user, blogPost, value);
      expect(result).toEqual(rating);
    });

    it('should throw BadRequestException if user has already rated', async () => {
      const user = { email: 'test@example.com' } as User;
      const blogPost = { id: 1 } as BlogPost;
      const value = 5;
      const existingRating = {
        id: 1,
        email: user.email,
        blogPost,
        value,
      } as Rating;

      jest.spyOn(ratingRepository, 'findOne').mockResolvedValue(existingRating);

      await expect(service.createRating(user, blogPost, value)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getRatingsByBlogPost', () => {
    it('should get ratings by blog post ID', async () => {
      const blogPostId = 1;
      const ratings = [{ id: 1, value: 5 }] as Rating[];

      jest.spyOn(ratingRepository, 'find').mockResolvedValue(ratings);

      const result = await service.getRatingsByBlogPost(blogPostId);
      expect(result).toEqual(ratings);
    });
  });

  describe('Average Rating', () => {
    it('should get average rating for a blog post', async () => {
      const blogPostId = 1;
      const ratings = [
        { id: 1, value: 5 },
        { id: 2, value: 4 },
      ] as Rating[];

      jest.spyOn(ratingRepository, 'find').mockResolvedValue(ratings);

      const result = await service.getAverageRating(blogPostId);
      expect(result).toEqual(4.5);
    });

    it('should return 0 if no ratings are found', async () => {
      const blogPostId = 1;

      jest.spyOn(ratingRepository, 'find').mockResolvedValue([]);

      const result = await service.getAverageRating(blogPostId);
      expect(result).toEqual(0);
    });
  });
});
