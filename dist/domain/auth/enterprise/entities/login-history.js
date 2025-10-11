"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginHistory = void 0;
const entity_1 = require("../../../../core/entities/entity");
class LoginHistory extends entity_1.Entity {
    get userId() {
        return this.props.userId;
    }
    get ipAddress() {
        return this.props.ipAddress;
    }
    get userAgent() {
        return this.props.userAgent;
    }
    get success() {
        return this.props.success;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    static create(props, id) {
        return new LoginHistory({
            ...props,
            createdAt: new Date(),
        }, id);
    }
    static reconstruct(props, id) {
        return new LoginHistory(props, id);
    }
}
exports.LoginHistory = LoginHistory;
