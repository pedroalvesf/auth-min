"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessTokenPresenter = void 0;
class AccessTokenPresenter {
    static toHTTP(accessToken) {
        return {
            token: accessToken.token,
            expiresAt: accessToken.expiresAt
        };
    }
}
exports.AccessTokenPresenter = AccessTokenPresenter;
