import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { LoginDTO } from 'src/user/dto/login.dto';
import { UserDocument } from 'src/user/entities/user.entity';
// import { LoginDTO } from '../DTOs/login.dto';
// import { UserDocument, UserEntity } from 'src/models/user/user.entity';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(
    email: LoginDTO['email'],
    password: LoginDTO['password'],
  ): Promise<UserDocument> {
    const user = await this.authService.validateUser(password, email);
    console.log(user);
    console.log(email);
    console.log(password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }
}
