import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // set global prefix
  app.setGlobalPrefix('/api/v2');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove non-whitelisted properties
      forbidNonWhitelisted: true, // throw error when non-whitelisted properties are present
      transform: true, // transform payload to dto instance
      transformOptions: {
        enableImplicitConversion: true, // convert query params to their respective types
      },
    }),
  );
  await app.listen(process.env.PORT);
}
bootstrap();
