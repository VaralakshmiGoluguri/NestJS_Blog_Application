import { Test, TestingModule } from '@nestjs/testing';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { CreateBlogPostDto } from './dto/create-blog.dto';
import { BlogPost } from './entities/blog-post.entity';
import { JwtAuthGuard } from '../users/auth.guard';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MediaType } from './media-type.enum';
import { User } from '../users/entities/user.entity';

describe('BlogsController', () => {
  let controller: BlogsController;
  let service: BlogsService;

  const mockBlogsService = {
    create: jest.fn(),
    createMultiple: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    updateBlogPost: jest.fn(),
    deleteBlogPost: jest.fn(),
    findAllByUser: jest.fn(),
    deleteAllByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        {
          provide: BlogsService,
          useValue: mockBlogsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<BlogsController>(BlogsController);
    service = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a blog post', async () => {
      const createBlogPostDto: CreateBlogPostDto = {
        title: 'Test Blog',
        brief: 'Test Brief',
        content: 'Test Content',
        mediaUrls: [{ url: 'http://test.com/media', type: MediaType.IMAGE }],
      };

      const result = new BlogPost();
      result.id = 1;
      result.title = 'Test Blog';
      result.brief = 'Test Brief';
      result.content = 'Test Content';
      result.mediaUrls = [
        { url: 'http://test.com/media', type: MediaType.IMAGE },
      ];
      result.userId = 1;

      mockBlogsService.create.mockResolvedValue(result);

      expect(
        await controller.create(createBlogPostDto, { user: { userId: 1 } }),
      ).toEqual(result);
      expect(mockBlogsService.create).toHaveBeenCalledWith(
        createBlogPostDto,
        1,
      );
    });
  });

  describe('createMultiple', () => {
    it('should create multiple blog posts', async () => {
      const createBlogPostsDto: CreateBlogPostDto[] = [
        {
          title: 'Test Blog 1',
          brief: 'Test Brief 1',
          content: 'Test Content 1',
          mediaUrls: [{ url: 'http://test.com/media1', type: MediaType.IMAGE }],
        },
        {
          title: 'Test Blog 2',
          brief: 'Test Brief 2',
          content: 'Test Content 2',
          mediaUrls: [{ url: 'http://test.com/media2', type: MediaType.VIDEO }],
        },
      ];

      const result: BlogPost[] = createBlogPostsDto.map(
        (dto, index) =>
          ({
            id: index + 1,
            ...dto,
            userId: 1,
          }) as BlogPost,
      );

      mockBlogsService.createMultiple.mockResolvedValue(result);

      expect(
        await controller.createBlogPosts(createBlogPostsDto, {
          user: { userId: 1 },
        }),
      ).toEqual(result);
      expect(mockBlogsService.createMultiple).toHaveBeenCalledWith(
        createBlogPostsDto,
        1,
      );
    });
  });

  describe('findAll', () => {
    it('should return all blog posts', async () => {
      const result: BlogPost[] = [
        {
          id: 1,
          title: 'Test Blog 1',
          brief: 'Test Brief 1',
          content: 'Test Content 1',
          mediaUrls: [{ url: 'http://test.com/media1', type: MediaType.IMAGE }],
          user: new User(),
          userId: 1,
          averageRating: 0,
          ratings: [],
          comments: [],
        },
      ];

      mockBlogsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(mockBlogsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a single blog post by ID', async () => {
      const result: BlogPost = {
        id: 1,
        title: 'Test Blog 1',
        brief: 'Test Brief 1',
        content: 'Test Content 1',
        mediaUrls: [{ url: 'http://test.com/media1', type: MediaType.IMAGE }],
        userId: 1,
        averageRating: 0,
        ratings: [],
        comments: [],
        user: new User(),
      };

      mockBlogsService.findById.mockResolvedValue(result);

      expect(await controller.findById(1)).toEqual(result);
      expect(mockBlogsService.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if blog post not found', async () => {
      mockBlogsService.findById.mockResolvedValue(null);

      await expect(controller.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBlogPost', () => {
    it('should update a blog post by ID', async () => {
      const updateBlogPostDto: Partial<CreateBlogPostDto> = {
        title: 'Updated Blog',
      };

      const result = {
        statusCode: 200,
        message: 'Blog post updated successfully',
      };

      mockBlogsService.updateBlogPost.mockResolvedValue(result);

      expect(
        await controller.updateBlogPost(1, updateBlogPostDto, {
          user: { userId: 1 },
        }),
      ).toEqual(result);
      expect(mockBlogsService.updateBlogPost).toHaveBeenCalledWith(
        1,
        updateBlogPostDto,
        1,
      );
    });

    it('should throw ForbiddenException if user is not authorized to update the post', async () => {
      mockBlogsService.updateBlogPost.mockRejectedValue(
        new ForbiddenException(),
      );

      await expect(
        controller.updateBlogPost(1, {}, { user: { userId: 2 } }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteBlogPost', () => {
    it('should delete a blog post by ID', async () => {
      const result = {
        statusCode: 200,
        message: 'Blog post deleted successfully',
      };

      mockBlogsService.deleteBlogPost.mockResolvedValue(result);

      expect(
        await controller.deleteBlogPost(1, { user: { userId: 1 } }),
      ).toEqual(result);
      expect(mockBlogsService.deleteBlogPost).toHaveBeenCalledWith(1, 1);
    });

    it('should throw ForbiddenException if user is not authorized to delete the post', async () => {
      mockBlogsService.deleteBlogPost.mockRejectedValue(
        new ForbiddenException(),
      );

      await expect(
        controller.deleteBlogPost(1, { user: { userId: 2 } }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllByUser', () => {
    it('should return all blog posts for a specific user', async () => {
      const result: BlogPost[] = [
        {
          id: 1,
          title: 'Test Blog 1',
          brief: 'Test Brief 1',
          content: 'Test Content 1',
          mediaUrls: [{ url: 'http://test.com/media1', type: MediaType.IMAGE }],
          userId: 1,
          averageRating: 0,
          ratings: [],
          comments: [],
          user: new User(),
        },
      ];

      mockBlogsService.findAllByUser.mockResolvedValue(result);

      expect(await controller.findAllByUser(1)).toEqual(result);
      expect(mockBlogsService.findAllByUser).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if no blog posts found for user', async () => {
      mockBlogsService.findAllByUser.mockRejectedValue(new NotFoundException());

      await expect(controller.findAllByUser(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteAllByUser', () => {
    it('should delete all blog posts for the logged-in user', async () => {
      const result = {
        statusCode: 200,
        message: 'All blog posts deleted successfully',
      };

      mockBlogsService.deleteAllByUser.mockResolvedValue(result);

      expect(await controller.deleteAllByUser({ user: { userId: 1 } })).toEqual(
        result,
      );
      expect(mockBlogsService.deleteAllByUser).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockBlogsService.deleteAllByUser.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        controller.deleteAllByUser({ user: { userId: 2 } }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
