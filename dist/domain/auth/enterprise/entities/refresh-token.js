"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const entity_1 = require("../../../../core/entities/entity");
class RefreshToken extends entity_1.Entity {
    get userId() {
        return this.props.userId;
    }
    get deviceId() {
        return this.props.deviceId;
    }
    get token() {
        return this.props.token;
    }
    get expiresAt() {
        return this.props.expiresAt;
    }
    get revoked() {
        return this.props.revoked;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get revokedAt() {
        return this.props.revokedAt;
    }
    isExpired() {
        if (this.props.revoked) {
            return true;
        }
        return new Date() > this.props.expiresAt;
    }
    revoke() {
        this.props.revokedAt = new Date();
        this.props.revoked = true;
    }
    static create(props, id) {
        const refreshToken = new RefreshToken({
            ...props,
            createdAt: props.createdAt ?? new Date(),
        }, id);
        return refreshToken;
    }
    static reconstruct(props, id) {
        return new RefreshToken(props, id);
    }
}
exports.RefreshToken = RefreshToken;
