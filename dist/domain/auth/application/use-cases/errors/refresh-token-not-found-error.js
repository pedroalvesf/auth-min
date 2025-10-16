"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenNotFoundError = void 0;
class RefreshTokenNotFoundError extends Error {
    constructor() {
        super("Refresh token not found");
    }
}
exports.RefreshTokenNotFoundError = RefreshTokenNotFoundError;
