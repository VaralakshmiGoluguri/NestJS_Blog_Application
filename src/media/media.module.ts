import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { Media } from './entities/media.entity';
import { BlogPost } from 'src/blogs/entities/blog-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Media, BlogPost])],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
