import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { Permission } from '../../enterprise/entities/permission';
import { PermissionsRepository } from '../repositories/permissions-repository';
import { PermissionAlreadyExistsError } from './errors/permission-already-exists-error';

interface CreatePermissionUseCaseRequest {
  name: string;
  description?: string;
  resource: string;
  action: string;
}

type CreatePermissionUseCaseResponse = Either<
  PermissionAlreadyExistsError,
  {
    permission: Permission;
  }
>;

@Injectable()
export class CreatePermissionUseCase {
  constructor(private permissionsRepository: PermissionsRepository) {}

  async execute({
    name,
    description,
    resource,
    action,
  }: CreatePermissionUseCaseRequest): Promise<CreatePermissionUseCaseResponse> {
    const slug = `${resource}:${action}`;

    const existingPermission =
      await this.permissionsRepository.findByResourceAndAction(
        resource,
        action
      );

    if (existingPermission) {
      return left(new PermissionAlreadyExistsError(slug));
    }

    const permission = Permission.create({
      name,
      slug,
      description,
      resource,
      action,
    });

    await this.permissionsRepository.create(permission);

    return right({ permission });
  }
}
