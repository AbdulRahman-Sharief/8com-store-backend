import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Matches,
} from 'class-validator';
import { USERS_ROLES } from 'config/constants/constants';

export class CreateUserDTO {
  @Expose()
  @IsString({ message: 'First name must be a string.' })
  @IsNotEmpty({ message: 'First name must not be empty.' })
  firstName: string;

  @Expose()
  @IsString({ message: 'Last name must be a string.' })
  @IsNotEmpty({ message: 'Last name must not be empty.' })
  lastName: string;

  @Expose()
  @IsNumberString()
  @IsNotEmpty({ message: 'Phone number must not be empty.' })
  phone: string;

  @Expose()
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsNotEmpty({ message: 'Email must not be empty.' })
  email: string;

  @Expose()
  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password must not be empty.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, and one number.',
  })
  password: string;

  @Expose()
  @IsEnum(USERS_ROLES, {
    message: `Role must be one of: ${Object.values(USERS_ROLES).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Role must not be empty.' })
  role: string;
}
