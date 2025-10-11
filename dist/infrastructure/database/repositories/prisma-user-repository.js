"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const user_1 = require("../../../domain/entities/user");
const unique_entity_id_1 = require("../../../core/entities/unique-entity-id");
class PrismaUserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id: id.toString() }
        });
        if (!user)
            return null;
        return user_1.User.reconstruct({
            email: user.email,
            password: user.password,
            name: user.name || undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }, new unique_entity_id_1.UniqueEntityID(user.id));
    }
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email }
        });
        if (!user)
            return null;
        return user_1.User.reconstruct({
            email: user.email,
            password: user.password,
            name: user.name || undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }, new unique_entity_id_1.UniqueEntityID(user.id));
    }
    async save(user) {
        await this.prisma.user.upsert({
            where: { id: user.id.toString() },
            create: {
                id: user.id.toString(),
                email: user.email,
                password: user.password,
                name: user.name,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            update: {
                email: user.email,
                password: user.password,
                name: user.name,
                updatedAt: user.updatedAt
            }
        });
    }
    async delete(id) {
        await this.prisma.user.delete({
            where: { id: id.toString() }
        });
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
