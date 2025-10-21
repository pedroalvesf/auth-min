"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceNotFoundError = void 0;
class DeviceNotFoundError extends Error {
    constructor(identifier) {
        super(`Device not found: "${identifier}".`);
    }
}
exports.DeviceNotFoundError = DeviceNotFoundError;
