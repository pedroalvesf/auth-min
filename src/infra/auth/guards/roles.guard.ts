import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '@/infra/auth/decorators/require-role.decorator';
import { UsersRepository } from '@/domain/auth/application/repositories/users-repository';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersRepository: UsersRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      return false;
    }

    const userRoles = await this.usersRepository.findRolesByUserId(user.sub);
    const userRoleSlugs = userRoles.map((role) => role.slug);

    return requiredRoles.some((role) => userRoleSlugs.includes(role));
  }
}
