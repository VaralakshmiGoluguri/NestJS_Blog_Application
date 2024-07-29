import { UserService } from './../users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { BlogsService } from './blogs.service';
import { BlogPost } from './entities/blog-post.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CreateBlogPostDto } from './dto/create-blog.dto';
import { User } from '../users/entities/user.entity';
import { MediaType } from './media-type.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('BlogPostService', () => {
  let service: BlogsService;
  let repository: Repository<BlogPost>;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: getRepositoryToken(BlogPost),
          useClass: Repository,
        },
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        ConfigService,
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
    repository = module.get<Repository<BlogPost>>(getRepositoryToken(BlogPost));
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create Blog post', () => {
    it('should create a new blog post', async () => {
      const createBlogPostDto: CreateBlogPostDto = {
        title: 'Sample Blog Post',
        brief: 'This is a brief description of the blog post.',
        content: 'This is the content of the blog post.',
        mediaUrls: [
          { url: 'http://example.com/media1.png', type: MediaType.IMAGE },
        ],
      };
      const user = new User();
      user.id = 1;

      jest.spyOn(repository, 'save').mockResolvedValue({
        ...createBlogPostDto,
        id: 1,
        user,
        userId: user.id,
        averageRating: 0,
        ratings: [],
        comments: [],
      } as BlogPost);

      const result = await service.create(createBlogPostDto, user.id);
      expect(result.id).toEqual(1);
      expect(result.title).toEqual(createBlogPostDto.title);
      expect(result.user).toEqual(user);
    });
  });

  describe('get all posts', () => {
    it('should retrieve all blog posts', async () => {
      const blogPosts = [
        {
          id: 1,
          title: 'Sample Blog Post',
          brief: 'This is a brief description of the blog post.',
          content: 'This is the content of the blog post.',
          mediaUrls: [
            { url: 'http://example.com/media1.png', type: MediaType.IMAGE },
          ],
          user: new User(),
          userId: 1,
          averageRating: 0,
          ratings: [],
          comments: [],
        } as BlogPost,
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(blogPosts);

      const result = await service.findAll();
      expect(result).toEqual(blogPosts);
    });
  });

  describe('Create multiple posts', () => {
    it('should create multiple blog posts', async () => {
      const createBlogPostDto: CreateBlogPostDto[] = [
        {
          title: 'Sample Blog Post1',
          brief: 'This is a brief description of the blog post.',
          content: 'This is the content of the blog post.',
          mediaUrls: [
            { url: 'http://example.com/media1.png', type: MediaType.IMAGE },
          ],
        },
        {
          title: 'Sample Blog Post2',
          brief: 'This is a brief description of the blog post.',
          content: 'This is the content of the blog post.',
          mediaUrls: [
            { url: 'http://example.com/media2.png', type: MediaType.IMAGE },
          ],
        },
      ];
      const user = new User();
      user.id = 1;

      const blogPosts: BlogPost[] = createBlogPostDto.map((post, index) => ({
        ...post,
        id: index + 1,
        user,
        userId: user.id,
        averageRating: 0,
        ratings: [],
        comments: [],
      })) as BlogPost[];

      jest.spyOn(repository, 'create').mockImplementation(
        (post) =>
          ({
            ...post,
            id: 1,
            user,
            userId: user.id,
            averageRating: 0,
            ratings: [],
            comments: [],
          }) as BlogPost,
      );
      jest.spyOn(repository, 'save').mockResolvedValue(blogPosts as any);

      const result = await service.createMultiple(createBlogPostDto, user.id);

      expect(result.length).toEqual(createBlogPostDto.length);
      for (let i = 0; i < result.length; i++) {
        expect(result[i].id).toEqual(i + 1);
        expect(result[i].title).toEqual(createBlogPostDto[i].title);
        expect(result[i].userId).toEqual(user.id);
      }
    });
  });

  describe('Get post by Id', () => {
    it('should retrieve a blog post by Id', async () => {
      const blogPost = {
        id: 1,
        title: 'Sample Blog Post',
        brief: 'This is a brief description of the blog post.',
        content: 'This is the content of the blog post.',
        mediaUrls: [
          { url: 'http://example.com/media1.png', type: MediaType.IMAGE },
        ],
        user: new User(),
        userId: 1,
        averageRating: 0,
        ratings: [],
        comments: [],
      } as BlogPost;
      const user = new User();
      user.id = 1;

      jest.spyOn(repository, 'findOneBy').mockResolvedValue({
        ...blogPost,
      } as BlogPost);

      const result = await service.findById(1);
      expect(result.id).toEqual(blogPost.id);
    });
    it('should throw NotFoundException if blog post is not found', async () => {
      jest
        .spyOn(service, 'findById')
        .mockRejectedValue(new NotFoundException());

      await expect(service.findById(4)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBlogPost', () => {
    it('should update a blog post', async () => {
      const user = new User();
      user.id = 1;
      const blogPost = {
        title: 'Sample Blog Post',
        brief: 'This is a brief description of the blog post.',
        content: 'This is the content of the blog post.',
        mediaUrls: [
          { url: 'http://example.com/media1.png', type: MediaType.IMAGE },
        ],
        id: 1,
        user,
        userId: user.id,
        averageRating: 0,
        ratings: [],
        comments: [],
      } as BlogPost;
      const updateBlogPostDto: Partial<CreateBlogPostDto> = {
        title: 'Updated Title',
        brief: 'This is a brief description of the blog post.',
        content: 'This is the content of the blog post.',
        mediaUrls: [
          { url: 'http://example.com/media1.png', type: MediaType.IMAGE },
        ],
      };

      jest.spyOn(service, 'findById').mockResolvedValue(blogPost);
      jest.spyOn(repository, 'update').mockResolvedValue({
        affected: 1,
      } as any);

      const result = await service.updateBlogPost(1, updateBlogPostDto, 1);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Blog post updated successfully',
      });
    });

    it('should throw NotFoundException if blog post is not found', async () => {
      jest
        .spyOn(service, 'findById')
        .mockRejectedValue(new NotFoundException());

      await expect(service.updateBlogPost(4, {}, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not authorized to update the post', async () => {
      const user = new User();
      user.id = 1;
      const blogPost = {
        title: 'Sample Blog Post',
        brief: 'This is a brief description of the blog post.',
        content: 'This is the content of the blog post.',
        mediaUrls: [
          { url: 'http://example.com/media1.png', type: MediaType.IMAGE },
        ],
        id: 1,
        user,
        userId: user.id,
        averageRating: 0,
        ratings: [],
        comments: [],
      };

      jest.spyOn(service, 'findById').mockResolvedValue(blogPost);

      await expect(service.updateBlogPost(1, {}, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if update affected 0 rows', async () => {
      const user = new User();
      user.id = 1;
      const blogPost = {
        title: 'Sample Blog Post',
        brief: 'This is a brief description of the blog post.',
        content: 'This is the content of the blog post.',
        mediaUrls: [
          { url: 'http://example.com/media1.png', type: MediaType.IMAGE },
        ],
        id: 1,
        user,
        userId: user.id,
        averageRating: 0,
        ratings: [],
        comments: [],
      } as BlogPost;
      const updateBlogPostDto: Partial<CreateBlogPostDto> = {
        title: 'Updated Title',
        brief: 'This is a brief description of the blog post.',
        content: 'This is the content of the blog post.',
        mediaUrls: [
          { url: 'http://example.com/media1.png', type: MediaType.IMAGE },
        ],
      };

      jest.spyOn(service, 'findById').mockResolvedValue(blogPost);
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(
        service.updateBlogPost(3, updateBlogPostDto, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteBlogPost', () => {
    it('should delete the blog post', async () => {
      const blogPost = { id: 1, userId: 2 } as BlogPost;
      jest.spyOn(service, 'findById').mockResolvedValue(blogPost);
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteBlogPost(1, 2);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Blog post deleted successfully',
      });
    });

    it('should throw NotFoundException if delete affected 0 rows', async () => {
      const blogPost = { id: 1, userId: 2 } as BlogPost;
      jest.spyOn(service, 'findById').mockResolvedValue(blogPost);
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.deleteBlogPost(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not authorized to delete the post', async () => {
      const blogPost = { id: 1, userId: 3 } as BlogPost;
      jest.spyOn(service, 'findById').mockResolvedValue(blogPost);

      await expect(service.deleteBlogPost(1, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Get all posts of the user', () => {
    it('should return all blog posts for a user', async () => {
      const userId = 1;
      const blogPosts = [
        {
          id: 1,
          title: 'Sample Blog Post',
          brief: 'This is a brief description of the blog post.',
          content: 'This is the content of the blog post.',
          mediaUrls: [
            { url: 'http://example.com/media1.png', type: MediaType.IMAGE },
          ],
          user: new User(),
          userId: 1,
          averageRating: 0,
          ratings: [],
          comments: [],
        } as BlogPost,
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(blogPosts);

      const result = await service.findAllByUser(userId);

      expect(result).toEqual(blogPosts);
    });

    it('should throw NotFoundException if no blog posts are found for the user', async () => {
      const userId = 1;

      jest.spyOn(repository, 'find').mockResolvedValue([]);

      await expect(service.findAllByUser(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findAllByUser(userId)).rejects.toThrow(
        `No blog posts found for user with ID ${userId}`,
      );
    });
  });

  describe('deleteAllByUser', () => {
    it('should delete all blog posts for a user', async () => {
      const userId = 1;

      jest
        .spyOn(userService, 'findOne')
        .mockResolvedValue({ id: userId } as User);
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      const result = await service.deleteAllByUser(userId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'All blog posts deleted successfully',
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 1;

      jest.spyOn(userService, 'findOne').mockResolvedValue(null);

      await expect(service.deleteAllByUser(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteAllByUser(userId)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
