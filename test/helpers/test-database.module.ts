import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { UsersRepository } from '@/domain/auth/application/repositories/users-repository';
import { DevicesRepository } from '@/domain/auth/application/repositories/devices-repository';
import { RefreshTokenRepository } from '@/domain/auth/application/repositories/refresh-token-repository';
import { RolesRepository } from '@/domain/auth/application/repositories/roles-repository';
import { PermissionsRepository } from '@/domain/auth/application/repositories/permissions-repository';
import { PrismaUsersRepository } from '@/infra/database/prisma/repositories/prisma-users-repository';
import { PrismaDevicesRepository } from '@/infra/database/prisma/repositories/prisma-devices-repository';
import { PrismaRefreshTokenRepository } from '@/infra/database/prisma/repositories/prisma-refresh-token-repository';
import { PrismaRolesRepository } from '@/infra/database/prisma/repositories/prisma-roles-repository';
import { PrismaPermissionsRepository } from '@/infra/database/prisma/repositories/prisma-permissions-repository';

class TestPrismaService {
  private client: PrismaClient;

  constructor() {
    // Create SQLite client for testing
    this.client = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./test/test.db'
        }
      }
    });
  }

  get $connect() {
    return this.client.$connect.bind(this.client);
  }

  get $disconnect() {
    return this.client.$disconnect.bind(this.client);
  }

  get $transaction() {
    return this.client.$transaction.bind(this.client);
  }

  get user() {
    return this.client.user;
  }

  get device() {
    return this.client.device;
  }

  get refreshToken() {
    return this.client.refreshToken;
  }

  get role() {
    return this.client.role;
  }

  get permission() {
    return this.client.permission;
  }

  get userRole() {
    return this.client.userRole;
  }

  get rolePermission() {
    return this.client.rolePermission;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useClass: TestPrismaService
    },
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository
    },
    {
      provide: DevicesRepository,
      useClass: PrismaDevicesRepository
    },
    {
      provide: RefreshTokenRepository,
      useClass: PrismaRefreshTokenRepository
    },
    {
      provide: RolesRepository,
      useClass: PrismaRolesRepository
    },
    {
      provide: PermissionsRepository,
      useClass: PrismaPermissionsRepository
    }
  ],
  exports: [
    PrismaService,
    UsersRepository,
    DevicesRepository,
    RefreshTokenRepository,
    RolesRepository,
    PermissionsRepository
  ]
})
export class TestDatabaseModule {}