import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JsonApiInterceptor } from './user/interceptors/response.interceptor';
import { JsonApiExceptionFilter } from './user/filters/http-exception.filter';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { JsonApiSerializerService } from './user/services/json-api-serializer.service';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new JsonApiExceptionFilter());
  app.useGlobalInterceptors(
    new JsonApiInterceptor(new JsonApiSerializerService()),
  );

  // Add swagger
  const options = new DocumentBuilder()
    .setTitle('Leovegas')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
      description: 'Enter your Bearer token',
    })
    .addSecurityRequirements('bearer')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document, {});
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(process.env.SERVER_PORT || 8080, () => {
    console.log(`Listening on PORT ${process.env.SERVER_PORT}`);
  });
}
bootstrap();
