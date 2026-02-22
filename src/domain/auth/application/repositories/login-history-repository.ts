import { LoginHistory } from '../../enterprise/entities/login-history';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';

export abstract class LoginHistoryRepository {
  abstract save(loginHistory: LoginHistory): Promise<void>;
  abstract findByUserId(
    userId: UniqueEntityID,
    limit?: number
  ): Promise<LoginHistory[]>;
  abstract findRecentFailedAttempts(
    ipAddress: string,
    minutesAgo: number
  ): Promise<LoginHistory[]>;
  abstract countByUserId(userId: UniqueEntityID): Promise<number>;
  abstract delete(id: UniqueEntityID): Promise<void>;
  abstract deleteOldRecords(daysAgo: number): Promise<void>;
}
