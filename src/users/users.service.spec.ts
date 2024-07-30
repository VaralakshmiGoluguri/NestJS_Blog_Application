import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let configService: ConfigService;

  const mockUserRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      const config = {
        JWT_SECRET: 'testsecret',
      };
      return config[key];
    }),
  };

  const user: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    blogPosts: [],
  };

  const newUserDto: CreateUserDto = {
    email: 'newuser@example.com',
    password: 'newpassword',
    name: 'New User',
  };

  const updatedUserDto: UpdateUserDto = {
    name: 'Updated Name',
    password: 'updatedpassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(user);
      mockUserRepository.save.mockResolvedValue(user);

      const result = await userService.createUser(newUserDto);
      expect(result).toEqual(user);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: newUserDto.email,
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: newUserDto.email,
        name: newUserDto.name,
        password: expect.any(String),
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(user);

      await expect(userService.createUser(newUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: newUserDto.email,
      });
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await userService.validateUser(user.email, 'password');
      expect(result).toEqual(user);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: user.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', user.password);
    });

    it('should return null for invalid credentials', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await userService.validateUser(
        user.email,
        'wrongpassword',
      );
      expect(result).toBeNull();
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: user.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        user.password,
      );
    });

    it('should return null if user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await userService.validateUser(
        'nonexistent@example.com',
        'password',
      );
      expect(result).toBeNull();
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: 'nonexistent@example.com',
      });
    });
  });

  describe('generateJwtToken', () => {
    it('should generate a JWT token', () => {
      const token = userService.generateJwtToken(user);
      const decoded = jwt.verify(
        token,
        configService.get<string>('JWT_SECRET'),
      );
      expect(decoded).toHaveProperty('email', user.email);
      expect(decoded).toHaveProperty('sub', user.id);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(user);

      const result = await userService.findOne(user.id);
      expect(result).toEqual(user);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: user.id,
      });
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await userService.findOne(user.id);
      expect(result).toBeNull();
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: user.id,
      });
    });
  });

  describe('updateUserDetails', () => {
    it('should update user details', async () => {
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({ ...user, ...updatedUserDto });

      const result = await userService.updateUserDetails(
        user.id,
        updatedUserDto.name,
        updatedUserDto.password,
      );
      expect(result).toEqual({ ...user, ...updatedUserDto });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: user.id }),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        userService.updateUserDetails(
          user.id,
          updatedUserDto.name,
          updatedUserDto.password,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });
  });
});
