import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLogger } from '../logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers } = request;

    const userAgent = headers['user-agent'] || 'Unknown';
    const userId = request.user?.sub || 'Anonymous';

    const startTime = Date.now();

    this.logger.log(`Incoming ${method} ${url}`, 'HTTP');

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;

          this.logger.logPerformance(`${method} ${url}`, duration, {
            statusCode: response.statusCode,
            ip,
            userAgent,
            userId,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.logger.logError(error, 'HTTP', {
            method,
            url,
            ip,
            userAgent,
            userId,
            duration,
          });
        },
      })
    );
  }
}
