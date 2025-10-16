import { AccessToken } from "../auth/enterprise/entities/access-token";
import { UniqueEntityID } from "../../core/entities/unique-entity-id";

export interface AccessTokenRepository {
  findByToken(token: string): Promise<AccessToken | null>;
  findByUserId(userId: UniqueEntityID): Promise<AccessToken[]>;
  save(accessToken: AccessToken): Promise<void>;
  delete(id: UniqueEntityID): Promise<void>;
  deleteByUserId(userId: UniqueEntityID): Promise<void>;
  deleteExpired(): Promise<void>;
  revokeByUserId(userId: UniqueEntityID): Promise<void>;
}