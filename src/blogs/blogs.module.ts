import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { User } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost, User])],
  controllers: [BlogsController],
  providers: [BlogsService, UserService],
})
export class BlogsModule {}
