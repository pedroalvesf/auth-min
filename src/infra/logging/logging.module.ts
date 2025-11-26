import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { EnvModule } from '../env/env.module';
import { EnvService } from '../env/env.service';

@Module({
  imports: [
    EnvModule,
    WinstonModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (_envService: EnvService) => {
        const isDevelopment = process.env.NODE_ENV === 'development';
        const isTest = process.env.NODE_ENV === 'test';

        const transports = [];

        // Console transport for development
        if (isDevelopment || isTest) {
          transports.push(
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.printf(
                  ({ timestamp, level, message, context, ...meta }) => {
                    return `${timestamp} [${
                      context || 'Application'
                    }] ${level}: ${message} ${
                      Object.keys(meta).length ? JSON.stringify(meta) : ''
                    }`;
                  }
                )
              ),
            })
          );
        }

        // File transport for production
        if (!isTest) {
          transports.push(
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
              ),
            }),
            new winston.transports.File({
              filename: 'logs/combined.log',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
              ),
            })
          );
        }

        return {
          level: isDevelopment ? 'debug' : 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          ),
          defaultMeta: {
            service: 'auth-min',
            environment: process.env.NODE_ENV || 'development',
          },
          transports,
        };
      },
    }),
  ],
  exports: [WinstonModule],
})
export class LoggingModule {}
