import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUserService = {
    createUser: jest.fn().mockImplementation((dto: CreateUserDto) => {
      return { id: 1, ...dto };
    }),
    validateUser: jest
      .fn()
      .mockImplementation((email: string, password: string) => {
        if (email === 'test@example.com' && password === 'password') {
          return {
            id: 1,
            email,
            name: 'Test User',
            password: 'hashedPassword',
          };
        }
        return null;
      }),
    generateJwtToken: jest
      .fn()
      .mockImplementation((user: User) => 'mockedJwtToken'),
    updateUserDetails: jest
      .fn()
      .mockImplementation((id: number, name: string, password: string) => {
        return { id, name, password };
      }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      expect(await userController.signup(dto)).toEqual({
        id: 1,
        ...dto,
      });
      expect(mockUserService.createUser).toHaveBeenCalledWith(dto);
    });

    it('should return error if user already exists', async () => {
      jest
        .spyOn(mockUserService, 'createUser')
        .mockRejectedValueOnce(
          new ConflictException('User with this email already exists'),
        );
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      await expect(userController.signup(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should return a JWT token if credentials are valid', async () => {
      const dto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      expect(await userController.login(dto)).toEqual({
        accessToken: 'mockedJwtToken',
      });
      expect(mockUserService.validateUser).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
      expect(mockUserService.generateJwtToken).toHaveBeenCalledWith({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
      });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const dto: LoginUserDto = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };
      await expect(userController.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUserService.validateUser).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      const dto: UpdateUserDto = {
        name: 'Updated Name',
        password: 'newpassword',
      };
      expect(await userController.updateUser(1, dto)).toEqual({
        id: 1,
        ...dto,
      });
      expect(mockUserService.updateUserDetails).toHaveBeenCalledWith(
        1,
        dto.name,
        dto.password,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      jest
        .spyOn(mockUserService, 'updateUserDetails')
        .mockRejectedValueOnce(new NotFoundException('User not found'));
      const dto: UpdateUserDto = {
        name: 'Updated Name',
        password: 'newpassword',
      };
      await expect(userController.updateUser(1, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
