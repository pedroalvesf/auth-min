"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenPresenter = void 0;
class RefreshTokenPresenter {
    static toHTTP(refreshToken) {
        return {
            token: refreshToken.token,
            expiresAt: refreshToken.expiresAt
        };
    }
}
exports.RefreshTokenPresenter = RefreshTokenPresenter;
