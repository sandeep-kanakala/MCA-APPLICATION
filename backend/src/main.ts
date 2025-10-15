import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import dotenv from 'dotenv';
import { AuditInterceptor } from './audit/interceptor/audit-log.interceptor';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerOptions } from './common/logger.service';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonLoggerOptions),
  });
  app.enableCors({
    origin: [process.env.APP_DOMAIN],
    credentials: true,
  });
  app.useGlobalPipes(new ZodValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('MCA REST API’s')
    .setDescription(
      'Multichoice secured REST based API’s as per Open API specs.',
    )
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

  SwaggerModule.setup('api/swagger', app, document);

  app.useGlobalInterceptors(app.get(AuditInterceptor));

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
