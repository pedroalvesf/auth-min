import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface PermissionProps {
  name: string;
  slug: string;
  description?: string;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Permission extends Entity<PermissionProps> {
  get name() {
    return this.props.name;
  }

  get slug() {
    return this.props.slug;
  }

  get description() {
    return this.props.description;
  }

  get resource() {
    return this.props.resource;
  }

  get action() {
    return this.props.action;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  set description(description: string | undefined) {
    this.props.description = description;
    this.touch();
  }

  matches(resource: string, action: string): boolean {
    // Suporta wildcard: "users:*" matches "users:create", "users:read", etc.
    if (this.props.action === '*' && this.props.resource === resource) {
      return true;
    }

    // Suporta super wildcard: "*:*" matches tudo
    if (this.props.resource === '*' && this.props.action === '*') {
      return true;
    }

    return this.props.resource === resource && this.props.action === action;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<PermissionProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID
  ) {
    const now = new Date();
    return new Permission(
      {
        ...props,
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      },
      id
    );
  }

  static reconstruct(props: PermissionProps, id: UniqueEntityID) {
    return new Permission(props, id);
  }
}
