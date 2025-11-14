import { Injectable, ExecutionContext, Inject } from '@nestjs/common'
import { ThrottlerGuard, ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler'
import { Reflector } from '@nestjs/core'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storage: ThrottlerStorage,
    protected readonly reflector: Reflector,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {
    super(options, storage, reflector)
  }

  async getTracker(req: Record<string, any>): Promise<string> {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown'
    const userAgent = req.headers['user-agent'] || 'unknown'
    
    if (req.user?.sub) {
      return `user:${req.user.sub}`
    }

    const shortUserAgent = userAgent.substring(0, 50)
    return `ip:${ip}:${Buffer.from(shortUserAgent).toString('base64').substring(0, 20)}`
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    
    if (request.url?.includes('/health')) {
      return true
    }

    if (request.headers['x-internal-service']) {
      return true
    }

    try {
      const canActivate = await super.canActivate(context)
      if (!canActivate) {
        this.logger.warn('Rate limit exceeded', {
          context: 'SECURITY',
          event: 'rate_limit_exceeded',
          ip: request.ip,
          url: request.url,
          method: request.method,
          userAgent: request.headers['user-agent'],
          userId: request.user?.sub || 'anonymous'
        })
      }
      return canActivate
    } catch (error) {
      this.logger.error('Throttler guard error', {
        context: 'SECURITY',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      return true // Allow by default on error
    }
  }
}