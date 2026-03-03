import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from '../../src/infra/env/env';
import { AppModule } from '../../src/app.module';

export class TestAppHelper {
  private static app: INestApplication;

  static async createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          validate: (env) => envSchema.parse(env),
          isGlobal: true,
        }),
        AppModule,
      ],
    }).compile();

    this.app = moduleFixture.createNestApplication();

    // Configure validation pipe like in production
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    await this.app.init();
    return this.app;
  }

  static async closeApp(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }

  static getApp(): INestApplication {
    return this.app;
  }
}
