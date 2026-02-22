import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY, PUBLIC_ENDPOINT_KEY } from './public';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly excludedRoutes: string[] = [];

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const publicEndpoints = this.reflector.getAllAndMerge<string[]>(
      PUBLIC_ENDPOINT_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (publicEndpoints && publicEndpoints.length) {
      const request = context.switchToHttp().getRequest();
      const { path } = request;

      if (publicEndpoints.some((endpoint) => path.startsWith(endpoint))) {
        return true;
      }
    }

    const request = context.switchToHttp().getRequest();
    if (request.path === '/metrics') {
      return true;
    }

    const { url } = request;

    if (this.excludedRoutes.some((route) => url.startsWith(route))) {
      return true;
    }

    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any, _info: any, _context: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
