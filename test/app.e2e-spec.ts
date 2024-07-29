import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateUserDto } from './../src/users/dto/create-user.dto';
import { CreateBlogPostDto } from '../src/blogs/dto/create-blog.dto';
import { CreateCommentDto } from './../src/comments/dto/create-comment.dto';
import { CreateRatingDto } from './../src/rating/dto/create-rating.dto';

describe('App E2E', () => {
  let app: INestApplication;
  let jwtToken: string;
  let blogPostId: number;
  let commentId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a user', () => {
    const createUserDto: CreateUserDto = {
      email: 'testuser3@example.com',
      password: 'password',
      name: 'Test User3',
    };

    return request(app.getHttpServer())
      .post('/users/signup')
      .send(createUserDto)
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('email', createUserDto.email);
        expect(response.body).toHaveProperty('name', createUserDto.name);
      });
  });

  it('should log in a user', () => {
    const loginUserDto = {
      email: 'testuser1@example.com',
      password: 'password',
    };

    return request(app.getHttpServer())
      .post('/users/login')
      .send(loginUserDto)
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('accessToken');
        jwtToken = response.body.accessToken;
      });
  });

  it('should create a blog post', () => {
    const createBlogPostDto: CreateBlogPostDto = {
      title: 'Test Blog Post',
      brief : 'Brief about the post',
      content: 'This is a test blog post',
    };

    return request(app.getHttpServer())
      .post('/blogs')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(createBlogPostDto)
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('title', createBlogPostDto.title);
        expect(response.body).toHaveProperty(
          'content',
          createBlogPostDto.content,
        );
        blogPostId = response.body.id;
      });
  });

  it('should create a comment on a blog post', () => {
    const createCommentDto: CreateCommentDto = {
      name: 'Name of the user',
      content: 'This is a test comment',
    };

    return request(app.getHttpServer())
      .post(`/comments/${blogPostId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(createCommentDto)
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty(
          'content',
          createCommentDto.content,
        );
        commentId = response.body.id;
      });
  });

  it('should get comments for a blog post', () => {
    return request(app.getHttpServer())
      .get(`/comments/post/${blogPostId}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body[0]).toHaveProperty(
          'content',
          'This is a test comment',
        );
      });
  });

  it('should create a rating for a blog post', () => {
    const createRatingDto: CreateRatingDto = {
      value: 5,
    };

    return request(app.getHttpServer())
      .post(`/ratings/${blogPostId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(createRatingDto)
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('value', createRatingDto.value);
      });
  });

  it('should get average rating for a blog post', () => {
    return request(app.getHttpServer())
      .get(`/ratings/${blogPostId}/average`)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty('averageRating', 5);
      });
  });

  it('should delete a comment', () => {
    return request(app.getHttpServer())
      .delete(`/comments/${commentId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty(
          'message',
          'Comment deleted successfully',
        );
      });
  });

  it('should delete a blog post', () => {
    return request(app.getHttpServer())
      .delete(`/blogs/${blogPostId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty(
          'message',
          'Blog post deleted successfully',
        );
      });
  });
});
