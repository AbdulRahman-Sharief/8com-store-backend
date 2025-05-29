import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Public } from 'src/decorators/Public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDTO } from 'src/user/dto/login.dto';
import { UserService } from 'src/user/user.service';
import { CreateUserDTO } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Body() body: LoginDTO, @Res() res: Response) {
    try {
      const { email, phone } = body;

      const user = await this.userService.findByEmailAndPhone(email, phone);
      const { accessToken } = await this.authService.login(
        user._id.toString(),
        user.email,
        user.role,
      );
      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Login successful',
        accessToken: accessToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        },
      });
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  @Public()
  @Post('/signup')
  async create(@Body() createUserDto: CreateUserDTO, @Res() res: Response) {
    try {
      const newUser = await this.userService.create(createUserDto);
      const { accessToken } = await this.authService.login(
        newUser._id.toString(),
        newUser.email,
        newUser.role,
      );
      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        message: 'User created successfully',
        accessToken,
        user: newUser,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: error.message,
      });
    }
  }
}
