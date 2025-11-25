import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RolePermissionsRepository } from '@/domain/auth/application/repositories/role-permissions-repository';
import { RolePermission } from '@/domain/auth/enterprise/entities/role-permission';
import { PrismaRolePermissionMapper } from '../mappers/prisma-role-permission-mapper';

@Injectable()
export class PrismaRolePermissionsRepository
  implements RolePermissionsRepository
{
  constructor(private prisma: PrismaService) {}

  async create(rolePermission: RolePermission): Promise<void> {
    const data = PrismaRolePermissionMapper.toPrisma(rolePermission);
    await this.prisma.rolePermission.create({ data });
  }

  async save(rolePermission: RolePermission): Promise<void> {
    const data = PrismaRolePermissionMapper.toPrisma(rolePermission);
    await this.prisma.rolePermission.update({
      where: { id: rolePermission.id.toString() },
      data,
    });
  }

  async findById(id: string): Promise<RolePermission | null> {
    const rolePermission = await this.prisma.rolePermission.findUnique({
      where: { id },
    });

    if (!rolePermission) return null;
    return PrismaRolePermissionMapper.toDomain(rolePermission);
  }

  async findByRoleId(roleId: string): Promise<RolePermission[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
    });

    return rolePermissions.map(PrismaRolePermissionMapper.toDomain);
  }

  async findByPermissionId(permissionId: string): Promise<RolePermission[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { permissionId },
    });

    return rolePermissions.map(PrismaRolePermissionMapper.toDomain);
  }

  async findByRoleAndPermission(
    roleId: string,
    permissionId: string
  ): Promise<RolePermission | null> {
    const rolePermission = await this.prisma.rolePermission.findFirst({
      where: {
        roleId,
        permissionId,
      },
    });

    if (!rolePermission) return null;
    return PrismaRolePermissionMapper.toDomain(rolePermission);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.rolePermission.delete({
      where: { id },
    });
  }

  async deleteByRoleId(roleId: string): Promise<void> {
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });
  }

  async deleteByPermissionId(permissionId: string): Promise<void> {
    await this.prisma.rolePermission.deleteMany({
      where: { permissionId },
    });
  }
}
