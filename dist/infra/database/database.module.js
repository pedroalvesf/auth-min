"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const users_repository_1 = require("../../domain/auth/application/repositories/users-repository");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
const prisma_users_repository_1 = require("./prisma/repositories/prisma-users-repository");
const prisma_refresh_token_repository_1 = require("./prisma/repositories/prisma-refresh-token-repository");
const devices_repository_1 = require("../../domain/auth/application/repositories/devices-repository");
const prisma_devices_repository_1 = require("./prisma/repositories/prisma-devices-repository");
const refresh_token_repository_1 = require("../../domain/auth/application/repositories/refresh-token-repository");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            prisma_service_1.PrismaService,
            {
                provide: devices_repository_1.DevicesRepository,
                useClass: prisma_devices_repository_1.PrismaDevicesRepository,
            },
            {
                provide: refresh_token_repository_1.RefreshTokenRepository,
                useClass: prisma_refresh_token_repository_1.PrismaRefreshTokenRepository,
            },
            {
                provide: users_repository_1.UsersRepository,
                useClass: prisma_users_repository_1.PrismaUsersRepository,
            },
        ],
        exports: [
            prisma_service_1.PrismaService,
            devices_repository_1.DevicesRepository,
            refresh_token_repository_1.RefreshTokenRepository,
            users_repository_1.UsersRepository,
        ],
    })
], DatabaseModule);
