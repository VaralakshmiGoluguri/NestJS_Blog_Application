import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { BlogsService } from '../blogs/blogs.service';
import { BlogPost } from '../blogs/entities/blog-post.entity';
import { UserService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, BlogPost, User])],
  controllers: [CommentsController],
  providers: [CommentsService, BlogsService, UserService],
})
export class CommentsModule {}
