import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Res,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';

import { UpdateUserDTO } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/role-auth.guard';
import { USERS_ROLES } from 'config/constants/constants';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles([USERS_ROLES.ADMIN])
  async findAll(@Res() res: Response) {
    try {
      const users = await this.userService.findAll();
      if (!users || users.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'No users found',
        });
      }
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Internal Server Error');
    }
  }
  @Get('/profile')
  async getUserInfo(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = req.user.userId;
      console.log('User ID from request:', userId);
      const user = await this.userService.findUserById(userId);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'User not found',
        });
      }
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      console.error('Error retrieving user:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error',
      });
    }
  }
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles([USERS_ROLES.ADMIN])
  async findOne(@Param('id') userId: string, @Res() res: Response) {
    try {
      const user = await this.userService.findUserById(userId);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'No user found',
        });
      }
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Internal Server Error');
    }
  }

  @Patch()
  async update(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDTO,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.userId;
      const updatedUser = await this.userService.update(userId, updateUserDto);
      if (!updatedUser) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'User not found',
        });
      }
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error',
      });
    }
  }
}
