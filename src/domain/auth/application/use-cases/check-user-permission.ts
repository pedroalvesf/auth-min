import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { UsersRepository } from '../repositories/users-repository';
import { PermissionsRepository } from '../repositories/permissions-repository';
import { UserNotFoundError } from './errors/user-not-found-error';
import { Permission } from '../../enterprise/entities/permission';

interface CheckUserPermissionUseCaseRequest {
  userId: string;
  resource: string;
  action: string;
}

type CheckUserPermissionUseCaseResponse = Either<
  UserNotFoundError,
  {
    hasPermission: boolean;
    reason?: string;
  }
>;

@Injectable()
export class CheckUserPermissionUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private permissionsRepository: PermissionsRepository
  ) {}

  async execute({
    userId,
    resource,
    action,
  }: CheckUserPermissionUseCaseRequest): Promise<CheckUserPermissionUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      return left(new UserNotFoundError(userId));
    }

    const userRoles = await this.usersRepository.findRolesByUserId(userId);

    if (userRoles.length === 0) {
      return right({
        hasPermission: false,
        reason: 'User has no roles assigned',
      });
    }

    let allPermissions: Permission[] = [];
    for (const role of userRoles) {
      const rolePermissions = await this.permissionsRepository.findByRoleId(
        role.id.toString()
      );
      allPermissions = [...allPermissions, ...rolePermissions];
    }

    const hasPermission = allPermissions.some((permission) =>
      permission.matches(resource, action)
    );

    return right({
      hasPermission,
      reason: hasPermission
        ? undefined
        : `Missing permission: ${resource}:${action}`,
    });
  }
}
