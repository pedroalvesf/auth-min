"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUserPresenter = void 0;
class ListUserPresenter {
    static toHTTP(user) {
        return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        };
    }
    static toPartnerHTTP(user) {
        return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            active: true,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    static toPartnerListHTTP(user) {
        return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
exports.ListUserPresenter = ListUserPresenter;
