import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type, Authorization, x-ipaddress, x-operatingsystem, x-browser, x-type',
  });

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Auth Module API')
    .setDescription(
      'Comprehensive authentication and authorization module with role-based access control, device management, and audit logging'
    )
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication and device management')
    .addTag('Authorization', 'Role and permission management')
    .addTag('Users', 'User management operations')
    .addTag('Health', 'System health checks and monitoring')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-ipaddress',
        in: 'header',
        description: 'Client IP address for device tracking',
      },
      'x-ipaddress'
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-operatingsystem',
        in: 'header',
        description: 'Operating system information',
      },
      'x-operatingsystem'
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-browser',
        in: 'header',
        description: 'Browser information',
      },
      'x-browser'
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-type',
        in: 'header',
        description: 'Device type (desktop, mobile, tablet)',
      },
      'x-type'
    )
    .setContact('Auth Module Team', '', 'auth@company.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = parseInt(process.env.PORT || '3000');

  await app.listen(port);

  console.log(`🚀 Auth service running on port ${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api`);
  console.log(`📦 NestJS DI configurado`);
  console.log(
    `💾 Memory usage: ${Math.round(
      process.memoryUsage().heapUsed / 1024 / 1024
    )}MB`
  );
}

bootstrap().catch(console.error);
