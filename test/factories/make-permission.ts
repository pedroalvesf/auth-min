import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Permission,
  PermissionProps,
} from '@/domain/auth/enterprise/entities/permission';

let permissionCounter = 0;

export function makePermission(
  override: Partial<PermissionProps> = {},
  id?: UniqueEntityID
) {
  permissionCounter++;

  const permission = Permission.create(
    {
      name: `Test Permission ${permissionCounter}`,
      slug: `resource-${permissionCounter}:action-${permissionCounter}`,
      resource: `resource-${permissionCounter}`,
      action: `action-${permissionCounter}`,
      description: `Test permission description ${permissionCounter}`,
      ...override,
    },
    id
  );

  return permission;
}
