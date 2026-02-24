import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { UserRole } from '@/domain/auth/enterprise/entities/user-role';
import { UserRole as PrismaUserRole } from '@/generated/prisma/client';

export class PrismaUserRoleMapper {
  static toDomain(raw: PrismaUserRole): UserRole {
    return UserRole.create(
      {
        userId: new UniqueEntityID(raw.userId),
        roleId: new UniqueEntityID(raw.roleId),
        assignedBy: raw.assignedBy
          ? new UniqueEntityID(raw.assignedBy)
          : undefined,
        assignedAt: raw.assignedAt,
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toPrisma(userRole: UserRole) {
    return {
      id: userRole.id.toString(),
      userId: userRole.userId.toString(),
      roleId: userRole.roleId.toString(),
      assignedAt: userRole.assignedAt,
      assignedBy: userRole.assignedBy?.toString() ?? null,
    };
  }
}
