import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRolesRepository } from '@/domain/auth/application/repositories/user-roles-repository';
import { UserRole } from '@/domain/auth/enterprise/entities/user-role';
import { PrismaUserRoleMapper } from '../mappers/prisma-user-role-mapper';

@Injectable()
export class PrismaUserRolesRepository implements UserRolesRepository {
  constructor(private prisma: PrismaService) {}

  async create(userRole: UserRole): Promise<void> {
    const data = PrismaUserRoleMapper.toPrisma(userRole);
    await this.prisma.userRole.create({ data });
  }

  async save(userRole: UserRole): Promise<void> {
    const data = PrismaUserRoleMapper.toPrisma(userRole);
    await this.prisma.userRole.update({
      where: { id: userRole.id.toString() },
      data,
    });
  }

  async findById(id: string): Promise<UserRole | null> {
    const userRole = await this.prisma.userRole.findUnique({
      where: { id },
    });

    if (!userRole) return null;
    return PrismaUserRoleMapper.toDomain(userRole);
  }

  async findByUserId(userId: string): Promise<UserRole[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      orderBy: { assignedAt: 'desc' },
    });

    return userRoles.map(PrismaUserRoleMapper.toDomain);
  }

  async findByRoleId(roleId: string): Promise<UserRole[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { roleId },
      orderBy: { assignedAt: 'desc' },
    });

    return userRoles.map(PrismaUserRoleMapper.toDomain);
  }

  async findByUserAndRole(
    userId: string,
    roleId: string
  ): Promise<UserRole | null> {
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
      },
    });

    if (!userRole) return null;
    return PrismaUserRoleMapper.toDomain(userRole);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userRole.delete({
      where: { id },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.userRole.deleteMany({
      where: { userId },
    });
  }

  async deleteByRoleId(roleId: string): Promise<void> {
    await this.prisma.userRole.deleteMany({
      where: { roleId },
    });
  }
}
