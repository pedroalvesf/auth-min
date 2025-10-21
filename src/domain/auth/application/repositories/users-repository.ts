import { User } from "@/domain/auth/enterprise/entities/user";

export abstract class UsersRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract save(user: User): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
