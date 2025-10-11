"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaLoginHistoryRepository = void 0;
const login_history_1 = require("../../../../domain/auth/enterprise/entities/login-history");
const unique_entity_id_1 = require("../../../../core/entities/unique-entity-id");
class PrismaLoginHistoryRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(loginHistory) {
        await this.prisma.loginHistory.create({
            data: {
                id: loginHistory.id.toString(),
                userId: loginHistory.userId.toString(),
                ipAddress: loginHistory.ipAddress,
                userAgent: loginHistory.userAgent,
                success: loginHistory.success,
                createdAt: loginHistory.createdAt,
            },
        });
    }
    async findByUserId(userId, limit = 50) {
        const histories = await this.prisma.loginHistory.findMany({
            where: { userId: userId.toString() },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
        return histories.map((history) => login_history_1.LoginHistory.reconstruct({
            userId: new unique_entity_id_1.UniqueEntityID(history.userId),
            ipAddress: history.ipAddress,
            userAgent: history.userAgent || undefined,
            success: history.success,
            createdAt: history.createdAt,
        }, new unique_entity_id_1.UniqueEntityID(history.id)));
    }
    async findRecentFailedAttempts(ipAddress, minutesAgo) {
        const timeThreshold = new Date(Date.now() - minutesAgo * 60 * 1000);
        const histories = await this.prisma.loginHistory.findMany({
            where: {
                ipAddress,
                success: false,
                createdAt: {
                    gte: timeThreshold,
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return histories.map((history) => login_history_1.LoginHistory.reconstruct({
            userId: new unique_entity_id_1.UniqueEntityID(history.userId),
            ipAddress: history.ipAddress,
            userAgent: history.userAgent || undefined,
            success: history.success,
            createdAt: history.createdAt,
        }, new unique_entity_id_1.UniqueEntityID(history.id)));
    }
    async countByUserId(userId) {
        return await this.prisma.loginHistory.count({
            where: { userId: userId.toString() },
        });
    }
    async delete(id) {
        await this.prisma.loginHistory.delete({
            where: { id: id.toString() },
        });
    }
    async deleteOldRecords(daysAgo) {
        const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        await this.prisma.loginHistory.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate,
                },
            },
        });
    }
}
exports.PrismaLoginHistoryRepository = PrismaLoginHistoryRepository;
