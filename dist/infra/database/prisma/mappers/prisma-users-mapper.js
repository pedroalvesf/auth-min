"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUsersMapper = void 0;
const user_1 = require("../../../../domain/auth/enterprise/entities/user");
const unique_entity_id_1 = require("../../../../core/entities/unique-entity-id");
class PrismaUsersMapper {
    static toDomain(raw) {
        return user_1.User.create({
            email: raw.email,
            password: raw.password,
            name: raw.name ?? undefined,
            lastLoginAt: raw.lastLoginAt ?? undefined,
        }, new unique_entity_id_1.UniqueEntityID(raw.id));
    }
    static toPrisma(user) {
        return {
            id: user.id.toString(),
            email: user.email,
            password: user.password,
            name: user.name,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    static toPrismaUpdate(user) {
        return {
            id: user.id.toString(),
            email: user.email,
            password: user.password,
            name: user.name,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            updatedAt: user.updatedAt,
        };
    }
}
exports.PrismaUsersMapper = PrismaUsersMapper;
