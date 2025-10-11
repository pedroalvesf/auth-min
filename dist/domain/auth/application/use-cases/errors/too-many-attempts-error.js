"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyAttemptsError = void 0;
class TooManyAttemptsError extends Error {
    constructor(timeRemaining) {
        super(`Too many failed attempts. Try again in ${Math.ceil(timeRemaining / 60)} minutes.`);
    }
}
exports.TooManyAttemptsError = TooManyAttemptsError;
