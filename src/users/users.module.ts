import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { User } from './entities/user.entity';
import { JwtStrategy } from './jwt.strategy';
import { BlogPost } from 'src/blogs/entities/blog-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, BlogPost])],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
})
export class UsersModule {}
