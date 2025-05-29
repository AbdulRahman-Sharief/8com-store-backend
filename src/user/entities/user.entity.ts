import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum, IsString } from 'class-validator';
import { NextFunction } from 'express';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { USERS_ROLES } from 'config/constants/constants';
// import { ProductEntity } from '../product/product.entity';
export type UserDocument = HydratedDocument<UserEntity>;

@Schema({ timestamps: true })
export class UserEntity {
  @Prop({ default: null })
  firstName: string;

  @Prop({ default: null })
  lastName: string;

  @Prop({ default: null, unique: true, sparse: true })
  phone: string;

  @Prop({ default: null, unique: true, sparse: true })
  email: string;

  @Prop({ required: true })
  @Exclude()
  @IsString({ message: 'password field must be of type string.' })
  password: string;

  @Prop({ default: new Date() })
  @Exclude()
  passwordChangedAt: Date;

  @Prop({ default: USERS_ROLES.CUSTOMER })
  @IsEnum(USERS_ROLES, {
    message: 'role field must be of either Customer or Admin or Seller.',
  })
  role: string;

  // hash the password
  async hashPassword() {
    if (this.password !== null) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }
  async comparePassword(attemptedPassword: string) {
    return await bcrypt.compare(attemptedPassword, this.password);
  }
  // toJSON() {
  //   return instanceToPlain(this);
  // }
  changePasswordAfter(JWTTimestamp: number) {
    if (this.passwordChangedAt) {
      const changedTimestamp = Math.floor(
        this.passwordChangedAt.getTime() / 1000,
      );
      return JWTTimestamp < changedTimestamp;
    }

    return false;
  }
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
// This function lets you pull in methods, statics, and virtuals from an ES6 class.
UserSchema.loadClass(UserEntity);

UserSchema.pre<UserDocument>('save', async function (next: NextFunction) {
  if (!this.isModified('password')) return next();
  try {
    await this.hashPassword();
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.pre<UserDocument>('save', async function (next: NextFunction) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});
