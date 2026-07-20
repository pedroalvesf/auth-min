import { Optional } from '@/core/types/optional';
import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface RefreshTokenProps {
  userId: UniqueEntityID;
  deviceId: UniqueEntityID;
  familyId: UniqueEntityID;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;
}

export class RefreshToken extends Entity<RefreshTokenProps> {
  get userId() {
    return this.props.userId;
  }

  get deviceId() {
    return this.props.deviceId;
  }

  get familyId() {
    return this.props.familyId;
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

  get revokedAt() {
    return this.props.revokedAt;
  }

  get revoked(): boolean {
    return this.props.revokedAt != null;
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  isRevoked(): boolean {
    return this.revoked;
  }

  isValid(): boolean {
    return !this.isRevoked() && !this.isExpired();
  }

  revoke() {
    if (this.props.revokedAt) return;
    this.props.revokedAt = new Date();
  }

  static create(
    props: Optional<RefreshTokenProps, 'createdAt' | 'familyId'>,
    id?: UniqueEntityID
  ) {
    const refreshToken = new RefreshToken(
      {
        ...props,
        familyId: props.familyId ?? new UniqueEntityID(),
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
