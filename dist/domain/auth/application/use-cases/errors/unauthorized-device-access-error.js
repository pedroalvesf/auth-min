"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedDeviceAccessError = void 0;
class UnauthorizedDeviceAccessError extends Error {
    constructor() {
        super('Unauthorized access to device');
        this.name = 'UnauthorizedDeviceAccessError';
    }
}
exports.UnauthorizedDeviceAccessError = UnauthorizedDeviceAccessError;
