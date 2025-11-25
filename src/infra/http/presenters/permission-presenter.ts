import { Permission } from '@/domain/auth/enterprise/entities/permission';

export class PermissionPresenter {
  static toHTTP(permission: Permission) {
    return {
      id: permission.id.toString(),
      name: permission.name,
      slug: permission.slug,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }

  static toHTTPList(permissions: Permission[]) {
    return permissions.map((permission) => this.toHTTP(permission));
  }
}
