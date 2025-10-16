"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const entity_1 = require("../../../../core/entities/entity");
class User extends entity_1.Entity {
    get email() {
        return this.props.email;
    }
    get password() {
        return this.props.password;
    }
    get name() {
        return this.props.name;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get isActive() {
        return this.props.isActive;
    }
    get lastLoginAt() {
        return this.props.lastLoginAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }
    set password(password) {
        this.props.password = password;
        this.touch();
    }
    set name(name) {
        this.props.name = name;
        this.touch();
    }
    set isActive(isActive) {
        this.props.isActive = isActive;
        this.touch();
    }
    updateLastLogin() {
        this.props.lastLoginAt = new Date();
        this.touch();
    }
    sign() {
        this.props.lastLoginAt = new Date();
        this.touch();
    }
    touch() {
        this.props.updatedAt = new Date();
    }
    static create(props, id) {
        const now = new Date();
        return new User({
            ...props,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        }, id);
    }
    static reconstruct(props, id) {
        return new User(props, id);
    }
}
exports.User = User;
