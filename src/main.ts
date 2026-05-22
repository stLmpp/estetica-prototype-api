import './config';
import './query-duration-logger';
import metadata from './metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import compression from 'compression';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { LoggerService } from './shared/logger/logger.service';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import { AppConfig } from './shared/config/app-config';
import { useContainer } from 'class-validator';
import { setupGracefulShutdown } from '@tygra/nestjs-graceful-shutdown';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { getAuthOpenApi } from './auth-openapi';
import { generateOpenApi } from './generate-open-api';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const logger = await app.resolve(LoggerService);
  app.useLogger(logger);
  app.use(compression());
  app.use(helmet());
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: false,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await SwaggerModule.loadPluginMetadata(metadata);
  const appConfig = app.get(AppConfig);
  const openapiConfig = new DocumentBuilder()
    .setTitle('WebGestor API')
    .setDescription('WebGestor API')
    .setVersion('1.0.0')
    .build();
  const authOpenApi = await getAuthOpenApi();
  SwaggerModule.setup(
    'openapi',
    app,
    () => {
      const document = SwaggerModule.createDocument(app, openapiConfig);
      return generateOpenApi(document, authOpenApi);
    },
    {
      jsonDocumentUrl: '/openapi.json',
      yamlDocumentUrl: '/openapi.yaml',
      swaggerOptions: {
        deepLinking: true,
        displayOperationId: true,
        displayRequestDuration: true,
      },
    },
  );

  setupGracefulShutdown({ app });

  const server = await app.listen(appConfig.port);

  server.setTimeout(appConfig.serverTimeoutMs);

  logger.log(`Application is running on: ${await app.getUrl()}`, {
    port: appConfig.port,
  });
}
bootstrap();
