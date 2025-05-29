import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Response } from 'express';
import { Public } from 'src/decorators/Public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDTO, @Res() res: Response) {
    try {
      const newUser = await this.userService.create(createUserDto);
      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        message: 'User created successfully',
        user: newUser,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: error.message,
      });
    }
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findUserById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDTO) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
