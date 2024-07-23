import { Test, TestingModule } from '@nestjs/testing';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';

describe('BlogsController', () => {
  let controller: BlogsController;
  let service: BlogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [BlogsService],
    }).compile();

    controller = module.get<BlogsController>(BlogsController);
    service = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a blog', () => {
    const blog = { id: 1, title: 'Test Blog' };
    jest.spyOn(service, 'create').mockImplementation(() => blog);
    expect(controller.create(blog)).toEqual(blog);
  });

  it('should find all blogs', () => {
    const blog = { id: 1, title: 'Test Blog' };
    jest.spyOn(service, 'findAll').mockImplementation(() => [blog]);
    expect(controller.findAll()).toEqual([blog]);
  });

  it('should find one blog', () => {
    const blog = { id: 1, title: 'Test Blog' };
    jest.spyOn(service, 'findOne').mockImplementation(() => blog);
    expect(controller.findOne('1')).toEqual(blog);
  });

  it('should update a blog', () => {
    const blog = { id: 1, title: 'Updated Blog' };
    jest.spyOn(service, 'update').mockImplementation(() => blog);
    expect(controller.update('1', blog)).toEqual(blog);
  });

  it('should remove a blog', () => {
    const blog = { id: 1, title: 'Test Blog' };
    jest.spyOn(service, 'remove').mockImplementation(() => blog);
    expect(controller.remove('1')).toEqual(blog);
  });
});
