import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PermissionsRepository } from '@/domain/auth/application/repositories/permissions-repository';
import { Permission } from '@/domain/auth/enterprise/entities/permission';
import { PrismaPermissionMapper } from '../mappers/prisma-permission-mapper';

@Injectable()
export class PrismaPermissionsRepository implements PermissionsRepository {
  constructor(private prisma: PrismaService) {}

  async create(permission: Permission): Promise<void> {
    const data = PrismaPermissionMapper.toPrisma(permission);
    await this.prisma.permission.create({ data });
  }

  async save(permission: Permission): Promise<void> {
    const data = PrismaPermissionMapper.toPrisma(permission);
    await this.prisma.permission.update({
      where: { id: permission.id.toString() },
      data,
    });
  }

  async findById(id: string): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) return null;
    return PrismaPermissionMapper.toDomain(permission);
  }

  async findBySlug(slug: string): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({
      where: { slug },
    });

    if (!permission) return null;
    return PrismaPermissionMapper.toDomain(permission);
  }

  async findByResourceAndAction(
    resource: string,
    action: string
  ): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({
      where: {
        resource_action: { resource, action },
      },
    });

    if (!permission) return null;
    return PrismaPermissionMapper.toDomain(permission);
  }

  async findMany(): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });

    return permissions.map(PrismaPermissionMapper.toDomain);
  }

  async findByRoleId(roleId: string): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      where: {
        Roles: {
          some: {
            Role: {
              id: roleId,
            },
          },
        },
      },
    });

    return permissions.map(PrismaPermissionMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.permission.delete({
      where: { id },
    });
  }
}
