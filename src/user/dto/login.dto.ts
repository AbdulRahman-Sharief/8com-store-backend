import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  @Expose()
  email: string;

  @IsNumberString()
  @IsNotEmpty()
  @Expose()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  password: string;
}
