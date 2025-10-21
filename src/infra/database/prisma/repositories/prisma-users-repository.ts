import { PrismaUsersMapper } from "../mappers/prisma-users-mapper";
import { UsersRepository } from "@/domain/auth/application/repositories/users-repository";
import { Injectable } from "@nestjs/common";
import { User } from "@/domain/auth/enterprise/entities/user";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? PrismaUsersMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return PrismaUsersMapper.toDomain(user);
  }

  async save(user: User): Promise<void> {
    const data = PrismaUsersMapper.toPrisma(user);
    await this.prisma.user.update({ where: { id: user.id.toString() }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
