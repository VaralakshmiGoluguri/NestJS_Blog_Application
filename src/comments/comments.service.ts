import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BlogsService } from 'src/blogs/blogs.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    private readonly blogsService: BlogsService,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}


  async createComment(
    comment: CreateCommentDto,
    blogPostId: number,
    email: string,
  ): Promise<Comment> {
    const blogPost = await this.blogsService.findById(blogPostId);
    if (!blogPost) {
      throw new Error('Blog post not found');
    }
    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return await this.commentRepository.save({ ...comment, email, blogPostId });
  }

  findAllByPostId(blogPostId: number): Promise<Comment[]> {
    return this.commentRepository.find({ where: { blogPostId } });
  }

  async deleteComment(commentId: number, userEmail: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.email !== userEmail) {
      throw new UnauthorizedException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);
  }

  async deleteAllCommentsByUser(
    blogPostId: number,
    userEmail: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: userEmail },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.commentRepository
      .createQueryBuilder()
      .delete()
      .where('blogPostId = :blogPostId', { blogPostId })
      .andWhere('email = :email', { email: user.email })
      .execute();
  }

  async updateComment(
    commentId: number,
    userEmail: string,
    updatedContent: string,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOneBy({ id: commentId });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.email !== userEmail) {
      throw new UnauthorizedException('You can only update your own comments');
    }

    comment.content = updatedContent;
    return await this.commentRepository.save(comment);
  }
}
