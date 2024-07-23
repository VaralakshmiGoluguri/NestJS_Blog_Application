import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateBlogPostDto } from './dto/create-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(BlogPost)
    private BlogRepository: Repository<BlogPost>,
  ) {}
  private readonly blogs = [];

  //Create a BlogPost
  async create(blog: CreateBlogPostDto): Promise<BlogPost> {
    return this.BlogRepository.save(blog);
  }

  //Create multiple BlogPosts
  async createMultiple(blogs: CreateBlogPostDto[]): Promise<BlogPost[]> {
    const blogPosts = blogs.map((blog) => this.BlogRepository.create(blog));
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
  ): Promise<UpdateResult> {
    const result = await this.BlogRepository.update(id, updateBlogPostDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
    return result;
  }

  //Delete BlogPost by id
  async deleteBlogPost(id: number): Promise<DeleteResult> {
    const result = await this.BlogRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
    return result;
  }
}
