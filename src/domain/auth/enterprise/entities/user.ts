import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';
import { RoleList } from './role-list';
import { Role } from './role';

export interface UserProps {
  email: string;
  password: string;
  name?: string;
  isActive?: boolean;
  lastLoginAt?: Date;
  roles: RoleList;
  createdAt: Date;
  updatedAt?: Date;
}

export class User extends Entity<UserProps> {
  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }

  get name() {
    return this.props.name;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get isActive() {
    return this.props.isActive ?? true;
  }

  get lastLoginAt() {
    return this.props.lastLoginAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get roles() {
    return this.props.roles;
  }

  set password(password: string) {
    this.props.password = password;
    this.touch();
  }

  set name(name: string | undefined) {
    this.props.name = name;
    this.touch();
  }

  set isActive(isActive: boolean) {
    this.props.isActive = isActive;
    this.touch();
  }

  updateLastLogin() {
    this.props.lastLoginAt = new Date();
    this.touch();
  }

  sign() {
    this.props.lastLoginAt = new Date();
    this.touch();
  }

  addRole(role: Role) {
    this.props.roles.add(role);
    this.touch();
  }

  removeRole(role: Role) {
    this.props.roles.remove(role);
    this.touch();
  }

  hasRole(roleSlug: string): boolean {
    return this.props.roles.getItems().some((role) => role.slug === roleSlug);
  }

  /**
   * Verifica se o usuário possui uma permissão específica
   * @param permissionSlug - Slug da permissão a verificar
   * @returns true se o usuário possui a permissão
   */
  hasPermission(permissionSlug: string): boolean {
    const allPermissions = this.getAllPermissions();
    return allPermissions.includes(permissionSlug);
  }

  /**
   * Verifica se o usuário possui qualquer uma das permissões listadas
   * @param permissionSlugs - Array de slugs de permissões
   * @returns true se o usuário possui pelo menos uma das permissões
   */
  hasAnyPermission(permissionSlugs: string[]): boolean {
    const allPermissions = this.getAllPermissions();
    return permissionSlugs.some((permission) =>
      allPermissions.includes(permission)
    );
  }

  /**
   * Retorna todas as permissões do usuário (através de suas roles)
   * @returns Array com slugs de todas as permissões
   */
  getAllPermissions(): string[] {
    return this.props.roles.getItems().reduce((acc: string[], role) => {
      const rolePermissions = role.permissions
        .getItems()
        .map((permission) => permission.slug);
      return [...acc, ...rolePermissions];
    }, []);
  }

  /**
   * Retorna todas as roles do usuário
   * @returns Array com slugs de todas as roles
   */
  getAllRoles(): string[] {
    return this.props.roles.getItems().map((role) => role.slug);
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      UserProps,
      'createdAt' | 'updatedAt' | 'roles' | 'isActive'
    >,
    id?: UniqueEntityID
  ) {
    return new User(
      {
        ...props,
        roles: props.roles ?? new RoleList(),
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id
    );
  }

  static reconstruct(props: UserProps, id?: UniqueEntityID) {
    return new User(props, id);
  }
}
