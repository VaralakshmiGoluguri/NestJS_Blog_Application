import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BlogsService } from '../blogs/blogs.service';
import { User } from '../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { BlogPost } from '../blogs/entities/blog-post.entity';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepository: Repository<Comment>;
  let userRepository: Repository<User>;
  let blogsService: BlogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: BlogsService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    blogsService = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const createCommentDto: CreateCommentDto = {
        name: 'user',
        content: 'This is a comment',
      };
      const blogPostId = 1;
      const email = 'user@example.com';

      const blogPost = new BlogPost();
      blogPost.id = blogPostId;

      const user = new User();
      user.email = email;

      jest.spyOn(blogsService, 'findById').mockResolvedValue(blogPost);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(commentRepository, 'save').mockResolvedValue({
        ...createCommentDto,
        email,
        blogPostId,
      } as Comment);

      const result = await service.createComment(
        createCommentDto,
        blogPostId,
        email,
      );

      expect(result).toEqual({
        ...createCommentDto,
        email,
        blogPostId,
      });
      expect(blogsService.findById).toHaveBeenCalledWith(blogPostId);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(commentRepository.save).toHaveBeenCalledWith({
        ...createCommentDto,
        email,
        blogPostId,
      });
    });

    it('should throw an error if blog post not found', async () => {
      const createCommentDto: CreateCommentDto = {
        name: 'user',
        content: 'This is a comment',
      };
      const blogPostId = 1;
      const email = 'user@example.com';

      jest.spyOn(blogsService, 'findById').mockResolvedValue(null);

      await expect(
        service.createComment(createCommentDto, blogPostId, email),
      ).rejects.toThrow('Blog post not found');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const createCommentDto: CreateCommentDto = {
        name: 'user',
        content: 'This is a comment',
      };
      const blogPostId = 1;
      const email = 'user@example.com';

      const blogPost = new BlogPost();
      blogPost.id = blogPostId;

      jest.spyOn(blogsService, 'findById').mockResolvedValue(blogPost);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.createComment(createCommentDto, blogPostId, email),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Get all comments based on id', () => {
    it('should find all comments by post ID', async () => {
      const blogPostId = 1;
      const comments: Comment[] = [
        {
          id: 1,
          content: 'Comment 1',
          blogPostId,
          email: 'test1@example.com',
          name: 'name',
          blogPost: new BlogPost(),
        },
        {
          id: 2,
          content: 'Comment 2',
          blogPostId,
          email: 'test2@example.com',
          name: 'name',
          blogPost: new BlogPost(),
        },
      ];

      jest.spyOn(commentRepository, 'find').mockResolvedValue(comments);

      const result = await service.findAllByPostId(blogPostId);
      expect(result).toEqual(comments);
    });
  });

  describe('Delete a comment', () => {
    it('should delete a comment', async () => {
      const commentId = 1;
      const email = 'test@example.com';
      const comment: Comment = {
        id: commentId,
        content: 'Comment',
        blogPostId: 1,
        email,
        name: 'name',
        blogPost: new BlogPost(),
      };

      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);
      jest.spyOn(commentRepository, 'remove').mockResolvedValue(comment);

      await service.deleteComment(commentId, email);
      expect(commentRepository.remove).toHaveBeenCalledWith(comment);
    });
    it("should throw UnauthorizedException when deleting someone else's comment", async () => {
      const commentId = 1;
      const email = 'test@example.com';
      const comment: Comment = {
        id: commentId,
        content: 'Comment',
        blogPostId: 1,
        email: 'other@example.com',
        name: 'name',
        blogPost: new BlogPost(),
      };

      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);

      await expect(service.deleteComment(commentId, email)).rejects.toThrow(
        UnauthorizedException,
      );
    });
    it('should throw an error if comment not found', async () => {
      const commentId = 1;
      const userEmail = 'user@example.com';

      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteComment(commentId, userEmail)).rejects.toThrow(
        'Comment not found',
      );
    });
  });

  describe('deleteAllCommentsByUser', () => {
    it('should delete all comments of a blog post by a user', async () => {
      const blogPostId = 1;
      const userEmail = 'user@example.com';

      const user = new User();
      user.email = userEmail;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const deleteQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };
      jest
        .spyOn(commentRepository, 'createQueryBuilder')
        .mockReturnValue(deleteQueryBuilder as any);

      await service.deleteAllCommentsByUser(blogPostId, userEmail);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: userEmail },
      });
      expect(commentRepository.createQueryBuilder).toHaveBeenCalled();
      expect(deleteQueryBuilder.delete).toHaveBeenCalled();
      expect(deleteQueryBuilder.where).toHaveBeenCalledWith(
        'blogPostId = :blogPostId',
        { blogPostId },
      );
      expect(deleteQueryBuilder.andWhere).toHaveBeenCalledWith(
        'email = :email',
        { email: userEmail },
      );
      expect(deleteQueryBuilder.execute).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const blogPostId = 1;
      const userEmail = 'user@example.com';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.deleteAllCommentsByUser(blogPostId, userEmail),
      ).rejects.toThrow(new UnauthorizedException('User not found'));
    });
  });

  describe('update a comment', () => {
    it('should update a comment', async () => {
      const commentId = 1;
      const email = 'test@example.com';
      const updatedContent = 'Updated comment';
      const comment: Comment = {
        id: commentId,
        content: 'Original comment',
        blogPostId: 1,
        email,
        name: '',
        blogPost: new BlogPost(),
      };

      jest.spyOn(commentRepository, 'findOneBy').mockResolvedValue(comment);
      jest
        .spyOn(commentRepository, 'save')
        .mockResolvedValue({ ...comment, content: updatedContent });

      const result = await service.updateComment(
        commentId,
        email,
        updatedContent,
      );
      expect(result).toEqual({ ...comment, content: updatedContent });
    });

    it("should throw UnauthorizedException when updating someone else's comment", async () => {
      const commentId = 1;
      const email = 'test@example.com';
      const updatedContent = 'Updated comment';
      const comment: Comment = {
        id: commentId,
        content: 'Original comment',
        blogPostId: 1,
        email: 'other@example.com',
        name: '',
        blogPost: new BlogPost(),
      };

      jest.spyOn(commentRepository, 'findOneBy').mockResolvedValue(comment);

      await expect(
        service.updateComment(commentId, email, updatedContent),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('should throw an error if comment not found', async () => {
      const commentId = 1;
      const userEmail = 'user@example.com';

      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteComment(commentId, userEmail)).rejects.toThrow(
        'Comment not found',
      );
    });
  });
});
