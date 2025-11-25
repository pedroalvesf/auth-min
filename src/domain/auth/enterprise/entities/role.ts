import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';
import { PermissionList } from './permission-list';
import { Permission } from './permission';

export interface RoleProps {
  name: string;
  slug: string;
  description?: string;
  level: number;
  assignableRoles: string[];
  permissions: PermissionList;
  createdAt: Date;
  updatedAt: Date;
}

export class Role extends Entity<RoleProps> {
  get name() {
    return this.props.name;
  }

  get slug() {
    return this.props.slug;
  }

  get description() {
    return this.props.description;
  }

  get level() {
    return this.props.level;
  }

  get assignableRoles() {
    return this.props.assignableRoles;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get permissions() {
    return this.props.permissions;
  }

  set description(description: string | undefined) {
    this.props.description = description;
    this.touch();
  }

  set assignableRoles(roles: string[]) {
    this.props.assignableRoles = roles;
    this.touch();
  }

  canAssignRole(roleLevel: number): boolean {
    return roleLevel > this.props.level;
  }

  addPermission(permission: Permission) {
    this.props.permissions.add(permission);
    this.touch();
  }

  removePermission(permission: Permission) {
    this.props.permissions.remove(permission);
    this.touch();
  }

  hasPermission(permissionSlug: string): boolean {
    return this.props.permissions
      .getItems()
      .some((permission) => permission.slug === permissionSlug);
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      RoleProps,
      'createdAt' | 'updatedAt' | 'level' | 'assignableRoles' | 'permissions'
    >,
    id?: UniqueEntityID
  ) {
    const now = new Date();
    return new Role(
      {
        ...props,
        level: props.level ?? 0,
        assignableRoles: props.assignableRoles ?? [],
        permissions: props.permissions ?? new PermissionList(),
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      },
      id
    );
  }

  static reconstruct(props: RoleProps, id: UniqueEntityID) {
    return new Role(props, id);
  }
}
