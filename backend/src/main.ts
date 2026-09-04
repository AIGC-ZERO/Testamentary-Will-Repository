import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: (process.env.CORS_ORIGIN || 'http://127.0.0.1:5173').split(','),
    credentials: true,
  });
  const port = Number(process.env.PORT || 3000);
  await app.listen(port, '127.0.0.1');
  // eslint-disable-next-line no-console
  console.log(`Will Repository API listening on http://127.0.0.1:${port}`);
}
bootstrap();
