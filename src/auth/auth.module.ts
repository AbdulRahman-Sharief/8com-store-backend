import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtGuardStrategy } from './guards/jwt-auth.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { LocalStrategy } from './guards/local-auth.strategy';
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET || 'defaultSecret',
        signOptions: {
          expiresIn: '30d',
        },
        global: true,
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtGuardStrategy, LocalStrategy],
})
export class AuthModule {}
