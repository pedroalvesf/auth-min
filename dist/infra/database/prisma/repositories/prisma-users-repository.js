"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUsersRepository = void 0;
const prisma_users_mapper_1 = require("../mappers/prisma-users-mapper");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PrismaUsersRepository = class PrismaUsersRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        return user ? prisma_users_mapper_1.PrismaUsersMapper.toDomain(user) : null;
    }
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user)
            return null;
        return prisma_users_mapper_1.PrismaUsersMapper.toDomain(user);
    }
    async save(user) {
        const data = prisma_users_mapper_1.PrismaUsersMapper.toPrisma(user);
        await this.prisma.user.update({ where: { id: user.id.toString() }, data });
    }
    async delete(id) {
        await this.prisma.user.delete({ where: { id } });
    }
};
exports.PrismaUsersRepository = PrismaUsersRepository;
exports.PrismaUsersRepository = PrismaUsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaUsersRepository);
