import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateBlogPostDto } from './dto/create-blog.dto';
import { UserService } from 'src/users/users.service';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(BlogPost)
    private BlogRepository: Repository<BlogPost>,
    private userService: UserService,
  ) {}

  //Create a BlogPost
  async create(blog: CreateBlogPostDto, userId: number): Promise<BlogPost> {
    return this.BlogRepository.save({ ...blog, userId });
  }

  //Create multiple BlogPosts
  async createMultiple(
    blogs: CreateBlogPostDto[],
    userId: number,
  ): Promise<BlogPost[]> {
    const blogPosts = blogs.map((blog) =>
      this.BlogRepository.create({ ...blog, userId }),
    );
    return await this.BlogRepository.save(blogPosts);
  }

  //Get all BlogPosts
  async findAll(): Promise<BlogPost[]> {
    return await this.BlogRepository.find();
  }

  //Get BlogPost by id
  async findById(id: number): Promise<BlogPost> {
    const blogPost = await this.BlogRepository.findOneBy({ id });
    if (!blogPost) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
    return blogPost;
  }

  //Update BlogPost by id
  async updateBlogPost(
    id: number,
    updateBlogPostDto: Partial<CreateBlogPostDto>,
    userId: number,
  ): Promise<UpdateResult> {
    const post = await this.findById(id);
    if (post && post.userId === userId) {
      const result = await this.BlogRepository.update(id, updateBlogPostDto);
      if (result.affected === 0) {
        throw new NotFoundException(`Blog post with ID ${id} not found`);
      }
      return result;
    }
    throw new ForbiddenException('You are not authorized to update this post');
  }

  //Delete BlogPost by id
  async deleteBlogPost(id: number, userId: number): Promise<DeleteResult> {
    const post = await this.findById(id);
    if (post && post.userId === userId) {
      const result = await this.BlogRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Blog post with ID ${id} not found`);
      }
      return result;
    }
    throw new ForbiddenException('You are not authorized to delete this post');
  }

  //Get all posts of user
  async findAllByUser(userId: number): Promise<BlogPost[]> {
    const blogPosts = await this.BlogRepository.find({
      where: { userId },
      relations: ['user'],
    });

    if (!blogPosts.length) {
      throw new NotFoundException(
        `No blog posts found for user with ID ${userId}`,
      );
    }

    return blogPosts;
  }

  //Delete all posts of user
  async deleteAllByUser(
    userId: number,
  ): Promise<{ statusCode: number; message: string }> {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.BlogRepository.delete({ userId });

    return {
      statusCode: 200,
      message: 'All blog posts deleted successfully',
    };
  }
}
