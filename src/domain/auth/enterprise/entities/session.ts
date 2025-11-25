import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface SessionProps {
  userId: UniqueEntityID;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export class Session extends Entity<SessionProps> {
  get userId() {
    return this.props.userId;
  }

  get token() {
    return this.props.token;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  static create(props: Omit<SessionProps, 'createdAt'>, id?: UniqueEntityID) {
    return new Session(
      {
        ...props,
        createdAt: new Date(),
      },
      id
    );
  }

  static reconstruct(props: SessionProps, id?: UniqueEntityID) {
    return new Session(props, id);
  }
}
