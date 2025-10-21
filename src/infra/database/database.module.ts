import { UsersRepository } from "@/domain/auth/application/repositories/users-repository";
import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaUsersRepository } from "./prisma/repositories/prisma-users-repository";
import { PrismaRefreshTokenRepository } from "./prisma/repositories/prisma-refresh-token-repository";
import { DevicesRepository } from "@/domain/auth/application/repositories/devices-repository";
import { PrismaDevicesRepository } from "./prisma/repositories/prisma-devices-repository";
import { RefreshTokenRepository } from "@/domain/auth/application/repositories/refresh-token-repository";

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
  ],
  exports: [
    PrismaService,
    DevicesRepository,
    RefreshTokenRepository,
    UsersRepository,
  ],
})
export class DatabaseModule {}
