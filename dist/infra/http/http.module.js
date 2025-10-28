"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const cryptography_module_1 = require("../cryptography/cryptography.module");
const env_module_1 = require("../env/env.module");
const auth_module_1 = require("../auth/auth.module");
const create_user_controller_1 = require("./controllers/auth/create-user.controller");
const authenticate_device_controller_1 = require("./controllers/auth/authenticate-device.controller");
const revoke_all_devices_controller_1 = require("./controllers/auth/revoke-all-devices.controller");
const revoke_device_session_controller_1 = require("./controllers/auth/revoke-device-session.controller");
const create_user_1 = require("../../domain/auth/application/use-cases/create-user");
const authenticate_device_1 = require("../../domain/auth/application/use-cases/authenticate-device");
const revoke_all_devices_1 = require("../../domain/auth/application/use-cases/revoke-all-devices");
const revoke_device_session_1 = require("../../domain/auth/application/use-cases/revoke-device-session");
let HttpModule = class HttpModule {
};
exports.HttpModule = HttpModule;
exports.HttpModule = HttpModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, cryptography_module_1.CryptographyModule, env_module_1.EnvModule, auth_module_1.AuthModule],
        controllers: [
            create_user_controller_1.CreateUserController,
            authenticate_device_controller_1.AuthenticateDeviceController,
            revoke_all_devices_controller_1.RevokeAllDevicesController,
            revoke_device_session_controller_1.RevokeDeviceSessionController,
        ],
        providers: [
            create_user_1.CreateUserUseCase,
            authenticate_device_1.AuthenticateDeviceUseCase,
            revoke_all_devices_1.RevokeAllDevicesUseCase,
            revoke_device_session_1.RevokeDeviceSessionUseCase,
        ],
    })
], HttpModule);
