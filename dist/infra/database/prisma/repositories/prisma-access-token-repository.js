"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAccessTokenRepository = void 0;
const access_token_1 = require("../../../../domain/auth/enterprise/entities/access-token");
const unique_entity_id_1 = require("../../../../core/entities/unique-entity-id");
class PrismaAccessTokenRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByToken(token) {
        const accessToken = await this.prisma.accessToken.findUnique({
            where: { token },
        });
        if (!accessToken) {
            return null;
        }
        return access_token_1.AccessToken.create({
            userId: new unique_entity_id_1.UniqueEntityID(accessToken.userId),
            token: accessToken.token,
            expiresAt: accessToken.expiresAt,
            createdAt: accessToken.createdAt,
            revoked: accessToken.revoked,
        }, new unique_entity_id_1.UniqueEntityID(accessToken.id));
    }
    async findByUserId(userId) {
        const accessTokens = await this.prisma.accessToken.findMany({
            where: { userId: userId.toString() },
            orderBy: { createdAt: "desc" },
        });
        return accessTokens.map((token) => access_token_1.AccessToken.create({
            userId: new unique_entity_id_1.UniqueEntityID(token.userId),
            token: token.token,
            expiresAt: token.expiresAt,
            createdAt: token.createdAt,
            revoked: token.revoked,
        }, new unique_entity_id_1.UniqueEntityID(token.id)));
    }
    async save(accessToken) {
        await this.prisma.accessToken.create({
            data: {
                id: accessToken.id.toString(),
                userId: accessToken.userId.toString(),
                token: accessToken.token,
                expiresAt: accessToken.expiresAt,
                createdAt: accessToken.createdAt,
            },
        });
    }
    async delete(id) {
        await this.prisma.accessToken.delete({
            where: { id: id.toString() },
        });
    }
    async deleteByUserId(userId) {
        await this.prisma.accessToken.deleteMany({
            where: { userId: userId.toString() },
        });
    }
    async deleteExpired() {
        await this.prisma.accessToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });
    }
}
exports.PrismaAccessTokenRepository = PrismaAccessTokenRepository;
