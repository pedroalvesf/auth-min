import { User } from "@/domain/auth/enterprise/entities/user";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export interface UsersRepository {
  findById(id: UniqueEntityID): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UniqueEntityID): Promise<void>;
}
