"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = void 0;
const entity_1 = require("../../../../core/entities/entity");
class Device extends entity_1.Entity {
    get userId() {
        return this.props.userId;
    }
    get name() {
        return this.props.name;
    }
    get type() {
        return this.props.type;
    }
    get operatingSystem() {
        return this.props.operatingSystem;
    }
    get ipAddress() {
        return this.props.ipAddress;
    }
    get lastLogin() {
        return this.props.lastLogin;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }
    get active() {
        return this.props.active;
    }
    get browser() {
        return this.props.browser;
    }
    get location() {
        return this.props.location;
    }
    set lastLogin(lastLogin) {
        this.props.lastLogin = lastLogin;
        this.touch();
    }
    set active(active) {
        this.props.active = active;
        this.touch();
    }
    deactivate() {
        this.props.active = false;
        this.touch();
    }
    touch() {
        this.props.updatedAt = new Date();
    }
    static create(props, id) {
        const device = new Device({
            ...props,
            location: props.location ?? "unknown",
            createdAt: props.createdAt ?? new Date(),
            lastLogin: props.lastLogin ?? new Date(),
        }, id);
        return device;
    }
}
exports.Device = Device;
