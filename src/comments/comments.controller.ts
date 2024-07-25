import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  Delete,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { JwtAuthGuard } from 'src/users/auth.guard';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':blogPostId')
  @ApiOperation({ summary: 'Create a new comment' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: 'The comment has been successfully created.',
    type: Comment,
  })
  @ApiBody({ type: CreateCommentDto })
  createComment(
    @Param('blogPostId') blogPostId: number,
    @Req() req,
    @Body() content: CreateCommentDto,
  ): Promise<Comment> {
    const userEmail = req.user.email;
    console.log('content', content);
    return this.commentsService.createComment(content, blogPostId, userEmail);
  }

  @Get('post/:blogPostId')
  @ApiOperation({ summary: 'Get comments for a specific blog post' })
  @ApiResponse({
    status: 200,
    description: 'List of comments for the specific blog post.',
    type: [Comment],
  })
  findAllByPostId(@Param('blogPostId') blogPostId: number) {
    return this.commentsService.findAllByPostId(blogPostId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete comment with commentId' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully.',
  })
  async deleteComment(@Param('id') commentId: number, @Req() req) {
    const userEmail = req.user.email;
    await this.commentsService.deleteComment(commentId, userEmail);
    return { message: 'Comment deleted successfully' };
  }

  @Delete('post/:blogPostId')
  @ApiOperation({ summary: 'Delete all comments of a post' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Comments deleted successfully.',
  })
  async deleteAllCommentsByUser(
    @Param('blogPostId') blogPostId: number,
    @Req() req,
  ) {
    const userEmail = req.user.email;
    await this.commentsService.deleteAllCommentsByUser(blogPostId, userEmail);
    return { message: 'All comments for the post deleted successfully' };
  }

  @Patch(':id')
  @ApiBody({ schema: { properties: { comment: { type: 'string' } } } })
  @ApiOperation({ summary: 'Update a comment' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Comments updated successfully.',
  })
  async updateComment(
    @Param('id') commentId: number,
    @Req() req,
    @Body('comment') updatedContent: string,
  ) {
    const userEmail = req.user.email;
    const updatedComment = await this.commentsService.updateComment(
      commentId,
      userEmail,
      updatedContent,
    );
    return updatedComment;
  }
}
