import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface AccessTokenProps {
  userId: UniqueEntityID;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revoked: boolean;
}

export class AccessToken extends Entity<AccessTokenProps> {
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

  get revoked() {
    return this.props.revoked;
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
    this.props.revoked = true;
  }

  static create(props: AccessTokenProps, id?: UniqueEntityID) {
    const accessToken = new AccessToken(props, id);
    return accessToken;
  }
}
