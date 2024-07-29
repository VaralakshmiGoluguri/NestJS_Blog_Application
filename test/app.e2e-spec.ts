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
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'testuser12@example.com', password: 'password' });
    jwtToken = response.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a user', () => {
    const createUserDto: CreateUserDto = {
      email: 'testuser12@example.com',
      password: 'password',
      name: 'Test User12',
    };

    return request(app.getHttpServer())
      .post('/users/signup')
      .send(createUserDto)
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('email', createUserDto.email);
        expect(response.body).toHaveProperty('name', createUserDto.name);
        userId = response.body.id;
      });
  });

  it('should log in a user', () => {
    const loginUserDto = {
      email: 'testuser12@example.com',
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
      brief: 'Brief about the post',
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

  it('should create multiple blog posts', () => {
    return request(app.getHttpServer())
      .post('/blogs/multiple')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send([
        {
          title: 'Post 1',
          brief: 'Brief 1',
          content: 'Content 1',
          mediaUrls: [],
        },
        {
          title: 'Post 2',
          brief: 'Brief 2',
          content: 'Content 2',
          mediaUrls: [],
        },
      ])
      .expect(201)
      .expect((res) => {
        expect(res.body.length).toBe(2);
        expect(res.body[0].title).toBe('Post 1');
        expect(res.body[1].title).toBe('Post 2');
      });
  });

  it('should get all blog posts by user ID', () => {
    // const userId = 1;
    return request(app.getHttpServer())
      .get(`/blogs/user/${userId}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('should get blog post by ID', () => {
    // const blogPostId = 1;
    return request(app.getHttpServer())
      .get(`/blogs/${blogPostId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(blogPostId);
      });
  });

  it('should return all blog posts', () => {
    return request(app.getHttpServer())
      .get('/blogs')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
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

  it('should update a comment by ID', () => {
    // const commentId = 1;
    return request(app.getHttpServer())
      .patch(`/comments/${commentId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ comment: 'Updated Comment' })
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(commentId);
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

  it('should delete all comments of a blog post given by the logged-in user', () => {
    // const blogPostId = 1;
    return request(app.getHttpServer())
      .delete(`/comments/post/${blogPostId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe(
          'All comments for the post deleted successfully',
        );
      });
  });

  it('should return ratings of a blog post', () => {
    // const blogPostId = 1;
    return request(app.getHttpServer())
      .get(`/ratings/${blogPostId}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('should update a blog post', () => {
    // const blogPostId = 1;
    return request(app.getHttpServer())
      .patch(`/blogs/${blogPostId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        title: 'Updated Title',
        brief: 'Updated Brief',
        content: 'updated content',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Blog post updated successfully');
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

  it('should delete all blog posts of the logged-in user', () => {
    return request(app.getHttpServer())
      .delete('/blogs/user/all')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('All blog posts deleted successfully');
      });
  });

  it('should update user details', () => {
    return request(app.getHttpServer())
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ name: 'Updated Name', password: 'newpassword' })
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('Updated Name');
      });
  });
});
