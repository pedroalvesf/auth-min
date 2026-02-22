import { PrismaUsersMapper } from '../mappers/prisma-users-mapper';
import { UsersRepository } from '@/domain/auth/application/repositories/users-repository';
import { Injectable } from '@nestjs/common';
import { User } from '@/domain/auth/enterprise/entities/user';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? PrismaUsersMapper.toDomain(user) : null;
  }

  async findByIdWithRoles(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        Roles: {
          include: {
            Role: true,
          },
        },
      },
    });

    if (!user) return null;

    // Transform structure to the format expected by the mapper
    const userWithRoles = {
      ...user,
      roles: user.Roles.map((userRole) => userRole.Role),
    };

    return PrismaUsersMapper.toDomain(userWithRoles);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return PrismaUsersMapper.toDomain(user);
  }

  async create(user: User): Promise<void> {
    const data = PrismaUsersMapper.toPrisma(user);
    await this.prisma.user.create({ data });
  }

  async save(user: User): Promise<void> {
    const data = PrismaUsersMapper.toPrismaUpdate(user);
    await this.prisma.user.update({ where: { id: user.id.toString() }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async assignRole(
    userId: string,
    roleId: string,
    assignedBy?: string
  ): Promise<void> {
    await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
        assignedBy,
      },
    });
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
  }

  async findRolesByUserId(userId: string) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { Role: true },
    });
    return userRoles.map((userRole) => ({
      id: userRole.Role.id,
      slug: userRole.Role.slug,
      name: userRole.Role.name,
    }));
  }
}
