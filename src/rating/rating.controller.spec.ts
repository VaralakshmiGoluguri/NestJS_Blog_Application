import { Test, TestingModule } from '@nestjs/testing';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { BlogsService } from '../blogs/blogs.service';
import { JwtAuthGuard } from '../users/auth.guard';
import { NotFoundException } from '@nestjs/common';

describe('RatingController', () => {
  let controller: RatingController;
  let ratingService: RatingService;

  const mockRatingService = {
    createRating: jest.fn(),
    getRatingsByBlogPost: jest.fn(),
    getAverageRating: jest.fn(),
  };

  const mockBlogsService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingController],
      providers: [
        { provide: RatingService, useValue: mockRatingService },
        { provide: BlogsService, useValue: mockBlogsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RatingController>(RatingController);
    ratingService = module.get<RatingService>(RatingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRating', () => {
    it('should create a rating', async () => {
      const user = { email: 'test@example.com' };
      const blogPostId = 1;
      const createRatingDto = { value: 5 };
      const req = { user };
      const blogPost = { id: blogPostId };

      mockBlogsService.findById.mockResolvedValue(blogPost);
      mockRatingService.createRating.mockResolvedValue({
        id: 1,
        ...createRatingDto,
        email: user.email,
        blogPost,
      });

      const result = await controller.createRating(
        req,
        blogPostId,
        createRatingDto,
      );

      expect(result).toEqual({
        id: 1,
        ...createRatingDto,
        email: user.email,
        blogPost,
      });
      expect(mockBlogsService.findById).toHaveBeenCalledWith(blogPostId);
      expect(mockRatingService.createRating).toHaveBeenCalledWith(
        user,
        blogPost,
        createRatingDto.value,
      );
    });

    it('should throw NotFoundException if blog post not found', async () => {
      const user = { email: 'test@example.com' };
      const blogPostId = 1;
      const createRatingDto = { value: 5 };
      const req = { user };

      mockBlogsService.findById.mockResolvedValue(null);

      await expect(
        controller.createRating(req, blogPostId, createRatingDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRatingsByBlogPost', () => {
    it('should return ratings for a blog post', async () => {
      const blogPostId = 1;
      const ratings = [
        {
          id: 1,
          value: 5,
          email: 'test@example.com',
          blogPost: { id: blogPostId },
        },
      ];

      mockRatingService.getRatingsByBlogPost.mockResolvedValue(ratings);

      const result = await controller.getRatingsByBlogPost(blogPostId);

      expect(result).toEqual(ratings);
      expect(mockRatingService.getRatingsByBlogPost).toHaveBeenCalledWith(
        blogPostId,
      );
    });
  });

  describe('getAverageRating', () => {
    it('should return the average rating for a blog post', async () => {
      const blogPostId = 1;
      const averageRating = 4.5;

      mockRatingService.getAverageRating.mockResolvedValue(averageRating);

      const result = await controller.getAverageRating(blogPostId);

      expect(result).toEqual({ averageRating });
      expect(mockRatingService.getAverageRating).toHaveBeenCalledWith(
        blogPostId,
      );
    });
  });
});
