import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config()
  const app= await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());


  const config = new DocumentBuilder()
    .setTitle('MCA REST API’s')
    .setDescription('Multichoice secured REST based API’s as per Open API specs.')
    .setVersion('3.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('mca/swagger-ui', app, document);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
