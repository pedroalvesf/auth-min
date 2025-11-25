import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface LoginHistoryProps {
  userId: UniqueEntityID;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  createdAt: Date;
}

export class LoginHistory extends Entity<LoginHistoryProps> {
  get userId() {
    return this.props.userId;
  }

  get ipAddress() {
    return this.props.ipAddress;
  }

  get userAgent() {
    return this.props.userAgent;
  }

  get success() {
    return this.props.success;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  static create(
    props: Omit<LoginHistoryProps, 'createdAt'>,
    id?: UniqueEntityID
  ) {
    return new LoginHistory(
      {
        ...props,
        createdAt: new Date(),
      },
      id
    );
  }

  static reconstruct(props: LoginHistoryProps, id?: UniqueEntityID) {
    return new LoginHistory(props, id);
  }
}
