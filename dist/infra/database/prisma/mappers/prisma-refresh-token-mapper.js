"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaRefreshTokenMapper = void 0;
const refresh_token_1 = require("../../../../domain/auth/enterprise/entities/refresh-token");
const unique_entity_id_1 = require("../../../../core/entities/unique-entity-id");
class PrismaRefreshTokenMapper {
    static toDomain(raw) {
        return refresh_token_1.RefreshToken.create({
            userId: new unique_entity_id_1.UniqueEntityID(raw.userId),
            token: raw.token,
            deviceId: new unique_entity_id_1.UniqueEntityID(raw.deviceId),
            createdAt: raw.createdAt,
            expiresAt: raw.expiresAt,
            revoked: raw.revoked,
        }, new unique_entity_id_1.UniqueEntityID(raw.id));
    }
    static toPrisma(refreshToken) {
        return {
            id: refreshToken.id.toString(),
            token: refreshToken.token,
            createdAt: refreshToken.createdAt,
            expiresAt: refreshToken.expiresAt,
            revokedAt: refreshToken.revokedAt,
            revoked: refreshToken.revoked,
            User: {
                connect: {
                    id: refreshToken.userId.toString(),
                },
            },
            Device: {
                connect: {
                    id: refreshToken.deviceId.toString(),
                },
            },
        };
    }
}
exports.PrismaRefreshTokenMapper = PrismaRefreshTokenMapper;
