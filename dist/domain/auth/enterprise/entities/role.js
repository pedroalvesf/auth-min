"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissions = exports.Role = void 0;
exports.hasPermission = hasPermission;
exports.canAccessResource = canAccessResource;
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["ADMIN"] = "ADMIN";
    Role["MODERATOR"] = "MODERATOR";
})(Role || (exports.Role = Role = {}));
exports.RolePermissions = {
    [Role.USER]: [
        'profile.read',
        'profile.update'
    ],
    [Role.MODERATOR]: [
        'profile.read',
        'profile.update',
        'users.read',
        'content.moderate'
    ],
    [Role.ADMIN]: [
        'profile.read',
        'profile.update',
        'users.read',
        'users.write',
        'users.delete',
        'content.moderate',
        'system.admin'
    ]
};
function hasPermission(userRole, requiredPermission) {
    return exports.RolePermissions[userRole].includes(requiredPermission);
}
function canAccessResource(userRole, requiredRole) {
    const roleHierarchy = {
        [Role.USER]: 1,
        [Role.MODERATOR]: 2,
        [Role.ADMIN]: 3
    };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
