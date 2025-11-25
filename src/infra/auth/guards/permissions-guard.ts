import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSION_KEY,
  RequiredPermission,
} from '@/infra/auth/decorators/require-permission.decorator';
import { CheckUserPermissionUseCase } from '@/domain/auth/application/use-cases/check-user-permission';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private checkPermission: CheckUserPermissionUseCase
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission =
      this.reflector.getAllAndOverride<RequiredPermission>(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      return false;
    }

    const result = await this.checkPermission.execute({
      userId: user.sub,
      resource: requiredPermission.resource,
      action: requiredPermission.action,
    });

    if (result.isLeft()) {
      return false;
    }

    return result.value.hasPermission;
  }
}
