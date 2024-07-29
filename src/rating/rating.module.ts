import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { Rating } from './entities/rating.entity';
import { BlogPost } from '../blogs/entities/blog-post.entity';
import { BlogsService } from '../blogs/blogs.service';
import { UserService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, BlogPost, User])],
  providers: [RatingService, BlogsService, UserService],
  controllers: [RatingController],
})
export class RatingModule {}
