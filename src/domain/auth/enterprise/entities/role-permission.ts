import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface RolePermissionProps {
  roleId: UniqueEntityID;
  permissionId: UniqueEntityID;
}

export class RolePermission extends Entity<RolePermissionProps> {
  get roleId() {
    return this.props.roleId;
  }

  get permissionId() {
    return this.props.permissionId;
  }

  static create(props: RolePermissionProps, id?: UniqueEntityID) {
    return new RolePermission(props, id);
  }

  static reconstruct(props: RolePermissionProps, id: UniqueEntityID) {
    return new RolePermission(props, id);
  }
}
