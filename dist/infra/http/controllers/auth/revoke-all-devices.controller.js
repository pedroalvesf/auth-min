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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevokeAllDevicesController = void 0;
const common_1 = require("@nestjs/common");
const device_not_found_error_1 = require("../../../../domain/auth/application/use-cases/errors/device-not-found-error");
const user_not_found_error_1 = require("../../../../domain/auth/application/use-cases/errors/user-not-found-error");
const revoke_all_devices_1 = require("../../../../domain/auth/application/use-cases/revoke-all-devices");
let RevokeAllDevicesController = class RevokeAllDevicesController {
    constructor(revokeAllDevices) {
        this.revokeAllDevices = revokeAllDevices;
    }
    async handle(userId) {
        const result = await this.revokeAllDevices.execute({
            userId,
        });
        if (result.isLeft()) {
            const error = result.value;
            switch (error.constructor) {
                case device_not_found_error_1.DeviceNotFoundError:
                    throw new common_1.BadRequestException("Device session not found");
                case user_not_found_error_1.UserNotFoundError:
                    throw new common_1.BadRequestException("User not found");
            }
        }
        return {
            success: true,
            message: "All devices revoked successfully",
        };
    }
};
exports.RevokeAllDevicesController = RevokeAllDevicesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RevokeAllDevicesController.prototype, "handle", null);
exports.RevokeAllDevicesController = RevokeAllDevicesController = __decorate([
    (0, common_1.Controller)("/logout/:userId"),
    __metadata("design:paramtypes", [revoke_all_devices_1.RevokeAllDevicesUseCase])
], RevokeAllDevicesController);
