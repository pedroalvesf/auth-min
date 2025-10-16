"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenExpiredError = void 0;
class RefreshTokenExpiredError extends Error {
    constructor() {
        super("Refresh token expired");
    }
}
exports.RefreshTokenExpiredError = RefreshTokenExpiredError;
