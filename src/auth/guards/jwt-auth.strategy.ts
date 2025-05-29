import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtGuardStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  // changePasswordAfter(user: UserDocument, JWTTimestamp: number) {
  //   const passwordChangedAt = new Date(user.passwordChangedAt);
  //   if (user.passwordChangedAt) {
  //     const changedTimestamp = Math.floor(passwordChangedAt.getTime() / 1000);
  //     console.log(JWTTimestamp, ' : ', changedTimestamp);
  //     return JWTTimestamp < changedTimestamp;
  //   }

  //   return false;
  // }
  async validate(payload: { _id: string; iat: number; exp: number }) {
    console.log('payload: ', payload);

    const user = await this.userService.findUserById(payload._id);
    // console.log(user);
    // console.log(new Date(user.passwordChangedAt));
    // if (this.changePasswordAfter(user, payload.iat)) {
    //   throw new HttpException(
    //     'This Token belongs to a user that has already changed his password.',
    //     401,
    //   );
    // }
    return { userId: payload._id, user };
  }
}
