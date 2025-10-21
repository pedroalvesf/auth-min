"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongCredentialsError = void 0;
class WrongCredentialsError extends Error {
    constructor() {
        super("Wrong credentials.");
    }
}
exports.WrongCredentialsError = WrongCredentialsError;
