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
import { MediaType } from '../blogs/media-type.enum';

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

  it('should create a comment', async () => {
    const createCommentDto: CreateCommentDto = {
      content: 'This is a test comment',
      name: 'name',
    };
    const blogPostId = 1;
    const email = 'test@example.com';
    const comment: Comment = {
      id: 1,
      content: 'This is a test comment',
      blogPostId,
      email,
      name: 'name',
      blogPost: new BlogPost(),
    };

    jest
      .spyOn(blogsService, 'findById')
      .mockResolvedValue({ id: blogPostId } as BlogPost);
    jest.spyOn(userRepository, 'findOne').mockResolvedValue({ email } as User);
    jest.spyOn(commentRepository, 'save').mockResolvedValue(comment);

    const result = await service.createComment(
      createCommentDto,
      blogPostId,
      email,
    );
    expect(result).toEqual(comment);
  });

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

  it('should delete all comments of a post by a user', async () => {
    const blogPostId = 1;
    const email = 'test@example.com';
    const user = { email } as User;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest
      .spyOn(commentRepository.createQueryBuilder(), 'delete')
      .mockReturnThis();
    jest
      .spyOn(commentRepository.createQueryBuilder(), 'where')
      .mockReturnThis();
    jest
      .spyOn(commentRepository.createQueryBuilder(), 'andWhere')
      .mockReturnThis();
    jest
      .spyOn(commentRepository.createQueryBuilder(), 'execute')
      .mockResolvedValue({});

    await service.deleteAllCommentsByUser(blogPostId, email);
    expect(commentRepository.createQueryBuilder().delete).toHaveBeenCalled();
  });

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
});
