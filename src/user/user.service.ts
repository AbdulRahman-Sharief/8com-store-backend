import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserEntity } from './entities/user.entity';
import mongoose, { Model } from 'mongoose';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private UserModel: Model<UserEntity>) {}

  async create(createUserDto: CreateUserDTO): Promise<UserDocument> {
    try {
      const user = new this.UserModel(createUserDto);
      return await user.save();
    } catch (err) {
      console.log(err);
      if (err.name === 'CastError') {
        const message = `Invalid ${err.path}`;
        throw new HttpException(message, 400);
      }
    }
  }

  async findAll(): Promise<UserDocument[]> {
    return this.UserModel.find().exec();
  }

  async findUserById(id: string): Promise<UserDocument> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new HttpException('Invalid ID format', 400);
      }
      console.log(id);

      const user = await this.UserModel.findById(id);
      console.log(user);
      return user;
    } catch (err) {
      console.log(err);
      if (err.name === 'CastError') {
        const message = `Resource Not found. Invalid ${err.path}`;
        throw new HttpException(message, 400);
      }
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDTO,
  ): Promise<UserDocument> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new HttpException('Invalid ID format', 400);
      }
      return this.UserModel.findByIdAndUpdate(id, updateUserDto, {
        new: true,
      }).exec();
    } catch (err) {
      console.log(err);
      if (err.name === 'CastError') {
        const message = `Invalid ${err.path}`;
        throw new HttpException(message, 400);
      }
    }
  }

  async remove(id: string): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('Invalid ID format', 400);
    }
    return this.UserModel.findByIdAndDelete(id).exec();
  }
}
