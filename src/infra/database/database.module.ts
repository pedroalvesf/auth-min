import { UsersRepository } from "@/domain/auth/application/repositories/users-repository";
import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaUsersRepository } from "./prisma/repositories/prisma-users-repository";
import { PrismaRefreshTokenRepository } from "./prisma/repositories/prisma-refresh-token-repository";
import { DevicesRepository } from "@/domain/auth/application/repositories/devices-repository";
import { PrismaDevicesRepository } from "./prisma/repositories/prisma-devices-repository";
import { RefreshTokenRepository } from "@/domain/auth/application/repositories/refresh-token-repository";
import { PermissionsRepository } from "@/domain/auth/application/repositories/permissions-repository";
import { PrismaRolesRepository } from "./prisma/repositories/prisma-roles-repository";
import { PrismaPermissionsRepository } from "./prisma/repositories/prisma-permissions-repository";
import { RolesRepository } from "@/domain/auth/application/repositories/roles-repository";
import { UserRolesRepository } from "@/domain/auth/application/repositories/user-roles-repository";
import { RolePermissionsRepository } from "@/domain/auth/application/repositories/role-permissions-repository";
import { PrismaUserRolesRepository } from "./prisma/repositories/prisma-user-roles-repository";
import { PrismaRolePermissionsRepository } from "./prisma/repositories/prisma-role-permissions-repository";

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: DevicesRepository,
      useClass: PrismaDevicesRepository,
    },
    {
      provide: RefreshTokenRepository,
      useClass: PrismaRefreshTokenRepository,
    },
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: RolesRepository,
      useClass: PrismaRolesRepository,
    },
    {
      provide: PermissionsRepository,
      useClass: PrismaPermissionsRepository,
    },
    {
      provide: UserRolesRepository,
      useClass: PrismaUserRolesRepository,
    },
    {
      provide: RolePermissionsRepository,
      useClass: PrismaRolePermissionsRepository,
    },
  ],
  exports: [
    PrismaService,
    DevicesRepository,
    RefreshTokenRepository,
    UsersRepository,
    RolesRepository,
    PermissionsRepository,
    UserRolesRepository,
    RolePermissionsRepository,
  ],
})
export class DatabaseModule {}
