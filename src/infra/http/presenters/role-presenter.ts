import { Role } from '@/domain/auth/enterprise/entities/role';

export class RolePresenter {
  static toHTTP(role: Role) {
    return {
      id: role.id.toString(),
      name: role.name,
      slug: role.slug,
      description: role.description,
      level: role.level,
      assignableRoles: role.assignableRoles,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  static toHTTPList(roles: Role[]) {
    return roles.map((role) => this.toHTTP(role));
  }
}
