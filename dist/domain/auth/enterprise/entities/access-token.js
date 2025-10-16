"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessToken = void 0;
const entity_1 = require("../../../../core/entities/entity");
class AccessToken extends entity_1.Entity {
    get userId() {
        return this.props.userId;
    }
    get token() {
        return this.props.token;
    }
    get expiresAt() {
        return this.props.expiresAt;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get revoked() {
        return this.props.revoked;
    }
    isExpired() {
        if (this.props.revoked) {
            return true;
        }
        return new Date() > this.props.expiresAt;
    }
    revoke() {
        this.props.revoked = true;
    }
    static create(props, id) {
        const accessToken = new AccessToken(props, id);
        return accessToken;
    }
}
exports.AccessToken = AccessToken;
