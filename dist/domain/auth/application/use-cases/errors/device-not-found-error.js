"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceNotFoundError = void 0;
class DeviceNotFoundError extends Error {
    constructor(deviceId) {
        super(`Device not found: "${deviceId}".`);
    }
}
exports.DeviceNotFoundError = DeviceNotFoundError;
