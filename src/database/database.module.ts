import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
      // autoCreate: true,
      // autoIndex: true,
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
