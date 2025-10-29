import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Role } from "@/domain/auth/enterprise/entities/role";
import { Role as PrismaRole } from "@prisma/client";

export class PrismaRoleMapper {
  static toDomain(raw: PrismaRole): Role {
    return Role.reconstruct(
      {
        name: raw.name,
        slug: raw.slug,
        description: raw.description ?? undefined,
        level: raw.level,
        assignableRoles: raw.assignableRoles,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toPrisma(role: Role): PrismaRole {
    return {
      id: role.id.toString(),
      name: role.name,
      slug: role.slug,
      description: role.description ?? null,
      level: role.level,
      assignableRoles: role.assignableRoles,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
