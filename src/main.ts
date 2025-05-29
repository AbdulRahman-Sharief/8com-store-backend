import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.enableCors({
    origin: '*', // Allow all origins
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transform plain objects to DTO instances
      whitelist: true,
      forbidNonWhitelisted: true, // Throw errors if non-whitelisted properties are present
      transformOptions: { excludeExtraneousValues: true },
    }),
  );
  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { limit: '50mb', extended: true });
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1/ecommerce/');
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  await app.listen(process.env.PORT);
}

bootstrap();
