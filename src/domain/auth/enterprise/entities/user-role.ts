import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface UserRoleProps {
  userId: UniqueEntityID;
  roleId: UniqueEntityID;
  assignedAt: Date;
  assignedBy?: UniqueEntityID;
}

export class UserRole extends Entity<UserRoleProps> {
  get userId() {
    return this.props.userId;
  }

  get roleId() {
    return this.props.roleId;
  }

  get assignedAt() {
    return this.props.assignedAt;
  }

  get assignedBy() {
    return this.props.assignedBy;
  }

  static create(
    props: Optional<UserRoleProps, 'assignedAt'>,
    id?: UniqueEntityID
  ) {
    return new UserRole(
      {
        ...props,
        assignedAt: props.assignedAt ?? new Date(),
      },
      id
    );
  }

  static reconstruct(props: UserRoleProps, id: UniqueEntityID) {
    return new UserRole(props, id);
  }
}
