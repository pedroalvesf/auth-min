"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaSessionRepository = void 0;
const session_1 = require("../../../domain/entities/session");
const unique_entity_id_1 = require("../../../core/entities/unique-entity-id");
class PrismaSessionRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByToken(token) {
        const session = await this.prisma.session.findUnique({
            where: { token },
        });
        if (!session)
            return null;
        return session_1.Session.reconstruct({
            userId: new unique_entity_id_1.UniqueEntityID(session.userId),
            token: session.token,
            expiresAt: session.expiresAt,
            createdAt: session.createdAt,
        }, new unique_entity_id_1.UniqueEntityID(session.id));
    }
    async findByUserId(userId) {
        const sessions = await this.prisma.session.findMany({
            where: { userId: userId.toString() },
        });
        return sessions.map((session) => session_1.Session.reconstruct({
            userId: new unique_entity_id_1.UniqueEntityID(session.userId),
            token: session.token,
            expiresAt: session.expiresAt,
            createdAt: session.createdAt,
        }, new unique_entity_id_1.UniqueEntityID(session.id)));
    }
    async save(session) {
        await this.prisma.session.upsert({
            where: { id: session.id.toString() },
            create: {
                id: session.id.toString(),
                userId: session.userId.toString(),
                token: session.token,
                expiresAt: session.expiresAt,
                createdAt: session.createdAt,
            },
            update: {
                userId: session.userId.toString(),
                token: session.token,
                expiresAt: session.expiresAt,
            },
        });
    }
    async delete(id) {
        await this.prisma.session.delete({
            where: { id: id.toString() },
        });
    }
    async deleteByUserId(userId) {
        await this.prisma.session.deleteMany({
            where: { userId: userId.toString() },
        });
    }
    async deleteExpired() {
        await this.prisma.session.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }
}
exports.PrismaSessionRepository = PrismaSessionRepository;
