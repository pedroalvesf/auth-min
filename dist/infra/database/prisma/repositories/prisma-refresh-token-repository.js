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
exports.PrismaRefreshTokenRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const prisma_refresh_token_mapper_1 = require("../mappers/prisma-refresh-token-mapper");
let PrismaRefreshTokenRepository = class PrismaRefreshTokenRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(refreshToken) {
        const data = prisma_refresh_token_mapper_1.PrismaRefreshTokenMapper.toPrisma(refreshToken);
        await this.prisma.refreshToken.create({ data });
    }
    async findByDeviceId(deviceId) {
        const refreshTokens = await this.prisma.refreshToken.findMany({
            where: { deviceId },
        });
        return refreshTokens.map(prisma_refresh_token_mapper_1.PrismaRefreshTokenMapper.toDomain);
    }
    async findByUserId(userId) {
        const refreshTokens = await this.prisma.refreshToken.findMany({
            where: { userId },
        });
        return refreshTokens.map(prisma_refresh_token_mapper_1.PrismaRefreshTokenMapper.toDomain);
    }
    async findByToken(token) {
        const refreshToken = await this.prisma.refreshToken.findUnique({
            where: { token },
        });
        return refreshToken
            ? prisma_refresh_token_mapper_1.PrismaRefreshTokenMapper.toDomain(refreshToken)
            : null;
    }
    async save(refreshToken) {
        const data = prisma_refresh_token_mapper_1.PrismaRefreshTokenMapper.toPrisma(refreshToken);
        await this.prisma.refreshToken.update({
            where: { id: refreshToken.id.toString() },
            data,
        });
    }
    async delete(id) {
        await this.prisma.refreshToken.delete({
            where: { id },
        });
    }
};
exports.PrismaRefreshTokenRepository = PrismaRefreshTokenRepository;
exports.PrismaRefreshTokenRepository = PrismaRefreshTokenRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaRefreshTokenRepository);
