import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { EnvModule } from '../env/env.module';
import { AuthModule } from '../auth/auth.module';

// Controllers - Auth
import { CreateUserController } from './controllers/auth/create-user.controller';
import { DeleteUserController } from './controllers/auth/delete-user.controller';
import { AuthenticateDeviceController } from './controllers/auth/authenticate-device.controller';
import { RevokeAllDevicesController } from './controllers/auth/revoke-all-devices.controller';
import { RevokeDeviceSessionController } from './controllers/auth/revoke-device-session.controller';

// Controllers - Roles
import { CreateRoleController } from './controllers/auth/create-role.controller';
import { ListRolesController } from './controllers/auth/list-roles.controller';
import { AssignRoleController } from './controllers/auth/assign-role.controller';
import { RemoveRoleController } from './controllers/auth/remove-role.controller';

// Controllers - Permissions
import { CreatePermissionController } from './controllers/auth/create-permission.controller';
import { ListPermissionsController } from './controllers/auth/list-permissions.controller';

// Use Cases - Auth
import { CreateUserUseCase } from '@/domain/auth/application/use-cases/create-user';
import { DeleteUserUseCase } from '@/domain/auth/application/use-cases/delete-user';
import { AuthenticateDeviceUseCase } from '@/domain/auth/application/use-cases/authenticate-device';
import { RevokeAllDevicesUseCase } from '@/domain/auth/application/use-cases/revoke-all-devices';
import { RevokeDeviceSessionUseCase } from '@/domain/auth/application/use-cases/revoke-device-session';

// Use Cases - Roles
import { CreateRoleUseCase } from '@/domain/auth/application/use-cases/create-role';
import { ListRolesUseCase } from '@/domain/auth/application/use-cases/list-roles';
import { AssignRoleToUserUseCase } from '@/domain/auth/application/use-cases/assign-role-to-user';
import { RemoveRoleFromUserUseCase } from '@/domain/auth/application/use-cases/remove-role-from-user';

// Use Cases - Permissions
import { CreatePermissionUseCase } from '@/domain/auth/application/use-cases/create-permission';
import { ListPermissionsUseCase } from '@/domain/auth/application/use-cases/list-permissions';
import { CheckUserPermissionUseCase } from '@/domain/auth/application/use-cases/check-user-permission';

@Module({
  imports: [DatabaseModule, CryptographyModule, EnvModule, AuthModule],
  controllers: [
    // Auth Controllers
    CreateUserController,
    DeleteUserController,
    AuthenticateDeviceController,
    RevokeAllDevicesController,
    RevokeDeviceSessionController,

    // Role Controllers
    CreateRoleController,
    ListRolesController,
    AssignRoleController,
    RemoveRoleController,

    // Permission Controllers
    CreatePermissionController,
    ListPermissionsController,
  ],
  providers: [
    // Auth Use Cases
    CreateUserUseCase,
    DeleteUserUseCase,
    AuthenticateDeviceUseCase,
    RevokeAllDevicesUseCase,
    RevokeDeviceSessionUseCase,

    // Role Use Cases
    CreateRoleUseCase,
    ListRolesUseCase,
    AssignRoleToUserUseCase,
    RemoveRoleFromUserUseCase,

    // Permission Use Cases
    CreatePermissionUseCase,
    ListPermissionsUseCase,
    CheckUserPermissionUseCase,
  ],
})
export class HttpModule {}
