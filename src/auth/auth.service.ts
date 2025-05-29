import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private UserModel: Model<UserEntity>,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async login(userId: string, email: string, role: string) {
    const payload = {
      sub: userId,
      email: email,
      role: role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  async validateUser(password: string, email: string) {
    try {
      const user = await this.UserModel.findOne({ email });
      if (!user) {
        return null;
      }
      const isPasswordCorrect = await user.comparePassword(password);

      console.log(isPasswordCorrect);
      if (user && isPasswordCorrect) {
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error validating user:', error);
      throw new Error('Internal Server Error');
    }
  }
}
