"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const entity_1 = require("../../core/entities/entity");
class Session extends entity_1.Entity {
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
    isExpired() {
        return new Date() > this.props.expiresAt;
    }
    static create(props, id) {
        return new Session({
            ...props,
            createdAt: new Date()
        }, id);
    }
    static reconstruct(props, id) {
        return new Session(props, id);
    }
}
exports.Session = Session;
