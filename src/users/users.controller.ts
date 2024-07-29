import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './auth.guard';

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
  @ApiOperation({ summary: 'Signup new user' })
  async signup(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(createUserDto);
  }

  @Post('login')
  @ApiBody({
    description: 'User login credentials',
    type: LoginUserDto,
  })
  @ApiResponse({
    status: 201,
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
  ): Promise<{ accessToken: string }> {
    const { email, password } = loginUserDto;
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = this.userService.generateJwtToken(user);
    return { accessToken };
  }

  @Put(':id')
  @ApiBody({
    description: 'User details',
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User details updated successfully',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Edit User Details' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const { name, password } = updateUserDto;
    return this.userService.updateUserDetails(id, name, password);
  }
}
