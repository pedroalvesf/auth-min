"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaRefreshTokenRepository = void 0;
const refresh_token_1 = require("../../../../domain/auth/enterprise/entities/refresh-token");
const unique_entity_id_1 = require("../../../../core/entities/unique-entity-id");
class PrismaRefreshTokenRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByToken(token) {
        const refreshToken = await this.prisma.refreshToken.findUnique({
            where: { token },
        });
        if (!refreshToken) {
            return null;
        }
        return refresh_token_1.RefreshToken.reconstruct({
            userId: new unique_entity_id_1.UniqueEntityID(refreshToken.userId),
            deviceId: new unique_entity_id_1.UniqueEntityID(refreshToken.deviceId),
            token: refreshToken.token,
            expiresAt: refreshToken.expiresAt,
            createdAt: refreshToken.createdAt,
            revokedAt: refreshToken.revokedAt ?? undefined,
            revoked: refreshToken.revoked,
        }, new unique_entity_id_1.UniqueEntityID(refreshToken.id));
    }
    async findByUserId(userId) {
        const refreshTokens = await this.prisma.refreshToken.findMany({
            where: { userId: userId.toString() },
            orderBy: { createdAt: "desc" },
        });
        return refreshTokens.map((token) => refresh_token_1.RefreshToken.reconstruct({
            userId: new unique_entity_id_1.UniqueEntityID(token.userId),
            token: token.token,
            expiresAt: token.expiresAt,
            createdAt: token.createdAt,
            revokedAt: token.revokedAt,
        }, new unique_entity_id_1.UniqueEntityID(token.id)));
    }
    async findValidByUserId(userId) {
        const refreshTokens = await this.prisma.refreshToken.findMany({
            where: {
                userId: userId.toString(),
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
        });
        return refreshTokens.map((token) => refresh_token_1.RefreshToken.reconstruct({
            userId: new unique_entity_id_1.UniqueEntityID(token.userId),
            token: token.token,
            expiresAt: token.expiresAt,
            createdAt: token.createdAt,
            revokedAt: token.revokedAt,
        }, new unique_entity_id_1.UniqueEntityID(token.id)));
    }
    async save(refreshToken) {
        await this.prisma.refreshToken.upsert({
            where: { id: refreshToken.id.toString() },
            create: {
                id: refreshToken.id.toString(),
                userId: refreshToken.userId.toString(),
                deviceId: refreshToken.deviceId.toString(),
                token: refreshToken.token,
                expiresAt: refreshToken.expiresAt,
                revokedAt: refreshToken.revokedAt ?? undefined,
                revoked: refreshToken.revoked,
                createdAt: refreshToken.createdAt,
            },
            update: {
                revokedAt: refreshToken.revokedAt ?? undefined,
                revoked: refreshToken.revoked,
            },
        });
    }
    async delete(id) {
        await this.prisma.refreshToken.delete({
            where: { id: id.toString() },
        });
    }
    async deleteByUserId(userId) {
        await this.prisma.refreshToken.deleteMany({
            where: { userId: userId.toString() },
        });
    }
    async deleteExpired() {
        await this.prisma.refreshToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });
    }
    async revokeByUserId(userId) {
        await this.prisma.refreshToken.updateMany({
            where: {
                userId: userId.toString(),
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }
}
exports.PrismaRefreshTokenRepository = PrismaRefreshTokenRepository;
