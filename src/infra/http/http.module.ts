import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { CryptographyModule } from "../cryptography/cryptography.module";
import { EnvModule } from "../env/env.module";
import { AuthModule } from "../auth/auth.module";
import { CreateUserController } from "./controllers/auth/create-user.controller";
import { AuthenticateDeviceController } from "./controllers/auth/authenticate-device.controller";
import { RevokeAllDevicesController } from "./controllers/auth/revoke-all-devices.controller";
import { RevokeDeviceSessionController } from "./controllers/auth/revoke-device-session.controller";
import { CreateUserUseCase } from "@/domain/auth/application/use-cases/create-user";
import { AuthenticateDeviceUseCase } from "@/domain/auth/application/use-cases/authenticate-device";
import { RevokeAllDevicesUseCase } from "@/domain/auth/application/use-cases/revoke-all-devices";
import { RevokeDeviceSessionUseCase } from "@/domain/auth/application/use-cases/revoke-device-session";

@Module({
  imports: [DatabaseModule, CryptographyModule, EnvModule, AuthModule],
  controllers: [
    CreateUserController,
    AuthenticateDeviceController,
    RevokeAllDevicesController,
    RevokeDeviceSessionController,
  ],
  providers: [
    CreateUserUseCase,
    AuthenticateDeviceUseCase,
    RevokeAllDevicesUseCase,
    RevokeDeviceSessionUseCase,
  ],
})
export class HttpModule {}
