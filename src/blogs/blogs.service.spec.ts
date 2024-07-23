import { Test, TestingModule } from '@nestjs/testing';
import { BlogsService } from './blogs.service';

describe('BlogsService', () => {
  let service: BlogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlogsService],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a blog', () => {
    const blog = { id: 1, title: 'Test Blog' };
    expect(service.create(blog)).toEqual(blog);
  });

  it('should find all blogs', () => {
    const blog = { id: 1, title: 'Test Blog' };
    service.create(blog);
    expect(service.findAll()).toEqual([blog]);
  });

  it('should find one blog', () => {
    const blog = { id: 1, title: 'Test Blog' };
    service.create(blog);
    expect(service.findOne(1)).toEqual(blog);
  });

  it('should update a blog', () => {
    const blog = { id: 1, title: 'Test Blog' };
    service.create(blog);
    const updatedBlog = { id: 1, title: 'Updated Blog' };
    expect(service.update(1, updatedBlog)).toEqual(updatedBlog);
  });

  it('should remove a blog', () => {
    const blog = { id: 1, title: 'Test Blog' };
    service.create(blog);
    expect(service.remove(1)).toEqual([blog]);
  });
});
