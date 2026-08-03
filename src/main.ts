import './config';
import './query-duration-logger';
import metadata from './metadata';
import { NestFactory } from '@nestjs/core';
import AppModule from './app.module';
import compression from 'compression';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import { LoggerService } from './core/logger/logger.service';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import { AppEnv } from './core/config/app-env';
import { setupGracefulShutdown } from '@tygra/nestjs-graceful-shutdown';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { getAuthOpenApi } from './core/openapi/auth-openapi';
import { generateOpenApi } from './core/openapi/generate-open-api';
import { Environment } from './shared/environment.enum';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  const logger = await app.resolve(LoggerService);
  app.useLogger(logger);
  app.use(compression()).use(helmet()).enableVersioning({
    type: VersioningType.URI,
  });
  app.enableCors({
    origin: 'http://localhost:4200', // Allows all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allows all methods
    allowedHeaders: ['Content-Type'], // Allows all custom and standard headers
    credentials: true,
  });
  await SwaggerModule.loadPluginMetadata(metadata);
  const appEnv = app.get(AppEnv);
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

  if (appEnv.environment === Environment.Production) {
    setupGracefulShutdown({ app });
  }

  const server = await app.listen(appEnv.port);

  server.setTimeout(appEnv.serverTimeoutMs);

  logger.log(`Application is running on: http://localhost:${appEnv.port}`, {
    port: appEnv.port,
  });
  logger.log(
    `OpenAPI server running on: http://localhost:${appEnv.port}/openapi`,
  );
}
bootstrap();
