import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { AuditInterceptor } from './audit/interceptor/audit-log.interceptor';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerOptions } from './common/logger.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonLoggerOptions),
  });
  app.enableCors({
    origin: [process.env.APP_DOMAIN, process.env.SERVER_DOMAIN],
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
  SwaggerModule.setup('api/swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useGlobalInterceptors(app.get(AuditInterceptor));

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap().catch((err) => {
  Logger.error('something went wrong!', err);
  process.exit(1);
});
