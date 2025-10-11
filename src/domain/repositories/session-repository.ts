import { Session } from "../auth/enterprise/entities/session";
import { UniqueEntityID } from "../../core/entities/unique-entity-id";

export interface SessionRepository {
  findByToken(token: string): Promise<Session | null>;
  findByUserId(userId: UniqueEntityID): Promise<Session[]>;
  save(session: Session): Promise<void>;
  delete(id: UniqueEntityID): Promise<void>;
  deleteByUserId(userId: UniqueEntityID): Promise<void>;
  deleteExpired(): Promise<void>;
}
