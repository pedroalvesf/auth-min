"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotFoundError = void 0;
class UserNotFoundError extends Error {
    constructor(identifier) {
        super(`User not found: "${identifier}".`);
    }
}
exports.UserNotFoundError = UserNotFoundError;
