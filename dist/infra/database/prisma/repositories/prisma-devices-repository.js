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
exports.PrismaDevicesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const prisma_devices_mapper_1 = require("../mappers/prisma-devices-mapper");
let PrismaDevicesRepository = class PrismaDevicesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByUserIdIp(userId, ipAddress) {
        const device = await this.prisma.device.findFirst({
            where: { userId, ipAddress }
        });
        return device ? prisma_devices_mapper_1.PrismaDevicesMapper.toDomain(device) : null;
    }
    async create(device) {
        await this.prisma.device.create({
            data: prisma_devices_mapper_1.PrismaDevicesMapper.toPrisma(device)
        });
    }
    async save(device) {
        await this.prisma.device.update({
            where: { id: device.id.toString() },
            data: prisma_devices_mapper_1.PrismaDevicesMapper.toPrisma(device)
        });
    }
    async findById(deviceId) {
        const device = await this.prisma.device.findUnique({
            where: { id: deviceId }
        });
        if (!device) {
            return null;
        }
        return prisma_devices_mapper_1.PrismaDevicesMapper.toDomain(device);
    }
    async findManyByUserId(userId) {
        const devices = await this.prisma.device.findMany({
            where: { userId }
        });
        const devicesDomain = devices.map(prisma_devices_mapper_1.PrismaDevicesMapper.toDomain);
        return devicesDomain.filter(device => device.active);
    }
};
exports.PrismaDevicesRepository = PrismaDevicesRepository;
exports.PrismaDevicesRepository = PrismaDevicesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaDevicesRepository);
