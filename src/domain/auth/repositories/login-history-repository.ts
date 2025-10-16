import { LoginHistory } from "../auth/enterprise/entities/login-history";
import { UniqueEntityID } from "../../core/entities/unique-entity-id";

export interface LoginHistoryRepository {
  save(loginHistory: LoginHistory): Promise<void>;
  findByUserId(userId: UniqueEntityID, limit?: number): Promise<LoginHistory[]>;
  findRecentFailedAttempts(
    ipAddress: string,
    minutesAgo: number
  ): Promise<LoginHistory[]>;
  countByUserId(userId: UniqueEntityID): Promise<number>;
  delete(id: UniqueEntityID): Promise<void>;
  deleteOldRecords(daysAgo: number): Promise<void>;
}
