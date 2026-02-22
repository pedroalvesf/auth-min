import { Optional } from '@/core/types/optional';
import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface RefreshTokenProps {
  userId: UniqueEntityID;
  deviceId: UniqueEntityID;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;
  revoked: boolean;
}

export class RefreshToken extends Entity<RefreshTokenProps> {
  get userId() {
    return this.props.userId;
  }

  get deviceId() {
    return this.props.deviceId;
  }

  get token() {
    return this.props.token;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  get revoked() {
    return this.props.revoked;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get revokedAt() {
    return this.props.revokedAt;
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  isRevoked(): boolean {
    return this.props.revoked;
  }

  isValid(): boolean {
    return !this.isRevoked() && !this.isExpired();
  }

  revoke() {
    this.props.revokedAt = new Date();
    this.props.revoked = true;
  }

  static create(
    props: Optional<RefreshTokenProps, 'createdAt'>,
    id?: UniqueEntityID
  ) {
    const refreshToken = new RefreshToken(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );
    return refreshToken;
  }

  static reconstruct(props: RefreshTokenProps, id?: UniqueEntityID) {
    return new RefreshToken(props, id);
  }
}
