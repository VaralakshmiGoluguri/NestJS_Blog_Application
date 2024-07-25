import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiOperation } from '@nestjs/swagger';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @ApiBody({
    description: 'User signup data',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully created.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async signup(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(createUserDto);
  }

  @Post('login')
  @ApiBody({
    description: 'User login credentials',
    type: LoginUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User login successful',
    type: String,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  @ApiOperation({ summary: 'Login user and return JWT' })
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ user: User; accessToken: string }> {
    const { email, password } = loginUserDto;
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = this.userService.generateJwtToken(user);
    return { user, accessToken };
  }
}
