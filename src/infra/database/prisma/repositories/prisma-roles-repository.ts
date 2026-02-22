import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RolesRepository } from '@/domain/auth/application/repositories/roles-repository';
import { Role } from '@/domain/auth/enterprise/entities/role';
import { PrismaRoleMapper } from '../mappers/prisma-role-mapper';

@Injectable()
export class PrismaRolesRepository implements RolesRepository {
  constructor(private prisma: PrismaService) {}

  async create(role: Role): Promise<void> {
    const data = PrismaRoleMapper.toPrisma(role);
    await this.prisma.role.create({ data });
  }

  async save(role: Role): Promise<void> {
    const data = PrismaRoleMapper.toPrisma(role);
    await this.prisma.role.update({
      where: { id: role.id.toString() },
      data,
    });
  }

  async findById(id: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) return null;
    return PrismaRoleMapper.toDomain(role);
  }

  async findByIdWithPermissions(id: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        Permissions: {
          include: {
            Permission: true,
          },
        },
      },
    });

    if (!role) return null;

    // Transform structure to the format expected by the mapper
    const roleWithPermissions = {
      ...role,
      permissions: role.Permissions.map(
        (rolePermission) => rolePermission.Permission
      ),
    };

    return PrismaRoleMapper.toDomain(roleWithPermissions);
  }

  async findBySlug(slug: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { slug },
    });

    if (!role) return null;
    return PrismaRoleMapper.toDomain(role);
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { name },
    });

    if (!role) return null;
    return PrismaRoleMapper.toDomain(role);
  }

  async findMany(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      orderBy: { level: 'asc' },
    });

    return roles.map(PrismaRoleMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({
      where: { id },
    });
  }
}
