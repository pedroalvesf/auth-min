import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class CustomLogger implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Custom methods for structured logging
  logAuth(
    action: string,
    userId: string,
    deviceId?: string,
    metadata?: Record<string, unknown>
  ) {
    this.logger.info('Authentication event', {
      context: 'AUTH',
      action,
      userId,
      deviceId,
      ...metadata,
    });
  }

  logSecurity(event: string, details: Record<string, unknown>) {
    this.logger.warn('Security event', {
      context: 'SECURITY',
      event,
      ...details,
    });
  }

  logPerformance(
    operation: string,
    duration: number,
    metadata?: Record<string, unknown>
  ) {
    this.logger.info('Performance metric', {
      context: 'PERFORMANCE',
      operation,
      duration,
      ...metadata,
    });
  }

  logError(error: Error, context: string, metadata?: Record<string, unknown>) {
    this.logger.error(error.message, {
      context,
      stack: error.stack,
      ...metadata,
    });
  }
}
