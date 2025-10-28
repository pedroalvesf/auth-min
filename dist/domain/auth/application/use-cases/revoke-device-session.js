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
exports.RevokeDeviceSessionUseCase = void 0;
const common_1 = require("@nestjs/common");
const either_1 = require("../../../../core/either");
const refresh_token_repository_1 = require("../repositories/refresh-token-repository");
const devices_repository_1 = require("../repositories/devices-repository");
const refresh_token_not_found_error_1 = require("./errors/refresh-token-not-found-error");
const device_not_found_error_1 = require("./errors/device-not-found-error");
let RevokeDeviceSessionUseCase = class RevokeDeviceSessionUseCase {
    constructor(refreshTokenRepository, devicesRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.devicesRepository = devicesRepository;
    }
    async execute({ deviceId, userId, }) {
        // Buscar todos os refresh tokens do dispositivo
        const refreshTokens = await this.refreshTokenRepository.findByDeviceId(deviceId);
        if (refreshTokens.length === 0) {
            return (0, either_1.left)(new refresh_token_not_found_error_1.RefreshTokenNotFoundError());
        }
        // Revogar todos os refresh tokens do dispositivo
        for (const refreshToken of refreshTokens) {
            if (!refreshToken.revoked) {
                refreshToken.revoke();
                await this.refreshTokenRepository.save(refreshToken);
            }
        }
        // Verificar se o dispositivo pertence ao usuário e desativá-lo
        const device = await this.devicesRepository.findById(deviceId);
        if (!device) {
            return (0, either_1.left)(new device_not_found_error_1.DeviceNotFoundError(deviceId));
        }
        // Verificar se o dispositivo pertence ao usuário
        if (device.userId.toString() !== userId) {
            return (0, either_1.left)(new device_not_found_error_1.DeviceNotFoundError(deviceId));
        }
        device.deactivate();
        await this.devicesRepository.save(device);
        return (0, either_1.right)({
            success: true,
        });
    }
};
exports.RevokeDeviceSessionUseCase = RevokeDeviceSessionUseCase;
exports.RevokeDeviceSessionUseCase = RevokeDeviceSessionUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [refresh_token_repository_1.RefreshTokenRepository,
        devices_repository_1.DevicesRepository])
], RevokeDeviceSessionUseCase);
