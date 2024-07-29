import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { JwtAuthGuard } from '../users/auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { MediaType } from '../blogs/media-type.enum';
import { BlogPost } from '../blogs/entities/blog-post.entity';
import { User } from '../users/entities/user.entity';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            createComment: jest.fn(),
            findAllByPostId: jest.fn(),
            deleteComment: jest.fn(),
            deleteAllCommentsByUser: jest.fn(),
            updateComment: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { email: 'test@example.com' };
          return true;
        },
      })
      .compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new comment', async () => {
    const createCommentDto: CreateCommentDto = {
      content: 'This is a test comment',
      name: 'Test User',
    };
    const comment: Comment = {
      id: 1,
      content: 'This is a test comment',
      name: 'User name',
      blogPostId: 1,
      blogPost: {
        title: 'Test Blog',
        brief: 'Test Brief',
        content: 'Test Content',
        mediaUrls: [{ url: 'http://test.com/media', type: MediaType.IMAGE }],
        id: 0,
        averageRating: 0,
        user: new User(),
        userId: 0,
        ratings: [],
        comments: [],
      },
      email: 'test@example.com',
    };

    jest.spyOn(service, 'createComment').mockResolvedValue(comment);

    const result = await controller.createComment(
      1,
      { user: { email: 'test@example.com' } } as any,
      createCommentDto,
    );
    expect(result).toEqual(comment);
  });

  it('should get comments for a specific blog post', async () => {
    const comments: Comment[] = [
      {
        id: 1,
        content: 'Comment 1',
        blogPostId: 1,
        email: 'test1@example.com',
        name: '',
        blogPost: new BlogPost(),
      },
      {
        id: 2,
        content: 'Comment 2',
        blogPostId: 1,
        email: 'test2@example.com',
        name: '',
        blogPost: new BlogPost(),
      },
    ];

    jest.spyOn(service, 'findAllByPostId').mockResolvedValue(comments);

    const result = await controller.findAllByPostId(1);
    expect(result).toEqual(comments);
  });

  it('should delete a comment', async () => {
    jest.spyOn(service, 'deleteComment').mockResolvedValue();

    const result = await controller.deleteComment(1, {
      user: { email: 'test@example.com' },
    } as any);
    expect(result).toEqual({ message: 'Comment deleted successfully' });
  });

  it('should delete all comments of a post by a user', async () => {
    jest.spyOn(service, 'deleteAllCommentsByUser').mockResolvedValue();

    const result = await controller.deleteAllCommentsByUser(1, {
      user: { email: 'test@example.com' },
    } as any);
    expect(result).toEqual({
      message: 'All comments for the post deleted successfully',
    });
  });

  it('should update a comment', async () => {
    const updatedComment: Comment = {
      id: 1,
      content: 'Updated comment',
      blogPostId: 1,
      email: 'test@example.com',
      name: '',
      blogPost: new BlogPost(),
    };

    jest.spyOn(service, 'updateComment').mockResolvedValue(updatedComment);

    const result = await controller.updateComment(
      1,
      { user: { email: 'test@example.com' } } as any,
      'Updated comment',
    );
    expect(result).toEqual(updatedComment);
  });
});
