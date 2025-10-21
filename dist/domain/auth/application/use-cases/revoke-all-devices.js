"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevokeAllDevicesUseCase = void 0;
const either_1 = require("../../../../core/either");
const devices_repository_1 = require("../repositories/devices-repository");
const refresh_token_repository_1 = require("../repositories/refresh-token-repository");
const users_repository_1 = require("../repositories/users-repository");
const user_not_found_error_1 = require("./errors/user-not-found-error");
const common_1 = require("@nestjs/common");
let RevokeAllDevicesUseCase = class RevokeAllDevicesUseCase {
    constructor(refreshTokenRepository, usersRepository, devicesRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.usersRepository = usersRepository;
        this.devicesRepository = devicesRepository;
    }
    async execute({ userId, }) {
        const user = await this.usersRepository.findById(userId);
        if (!user) {
            return (0, either_1.left)(new user_not_found_error_1.UserNotFoundError());
        }
        const devices = await this.devicesRepository.findManyByUserId(userId);
        const refreshTokens = await this.refreshTokenRepository.findByUserId(userId);
        for (const token of refreshTokens) {
            await this.refreshTokenRepository.delete(token.id.toString());
        }
        for (const device of devices) {
            device.active = false;
            await this.devicesRepository.save(device);
        }
        return (0, either_1.right)({ success: true });
    }
};
exports.RevokeAllDevicesUseCase = RevokeAllDevicesUseCase;
exports.RevokeAllDevicesUseCase = RevokeAllDevicesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [refresh_token_repository_1.RefreshTokenRepository,
        users_repository_1.UsersRepository,
        devices_repository_1.DevicesRepository])
], RevokeAllDevicesUseCase);
