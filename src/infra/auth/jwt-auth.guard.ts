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
  public excludedRoutes: string[] = [];

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

    // Verificar endpoints públicos especiais
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

    // Verificar se a rota é /metrics para o Prometheus
    const request = context.switchToHttp().getRequest();
    if (request.path === '/metrics') {
      return true;
    }

    // Verificar se a rota atual está na lista de rotas excluídas
    const { url } = request;

    if (this.excludedRoutes.some((route) => url.startsWith(route))) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    // Check if user has 2FA enabled but hasn't completed 2FA authentication
    if (user.isTwoFactorAuthenticated === false) {
      throw new UnauthorizedException('Two-factor authentication required');
    }

    return user;
  }
}
