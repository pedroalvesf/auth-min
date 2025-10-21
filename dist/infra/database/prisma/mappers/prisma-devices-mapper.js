"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaDevicesMapper = void 0;
const unique_entity_id_1 = require("../../../../core/entities/unique-entity-id");
const device_1 = require("../../../../domain/auth/enterprise/entities/device");
class PrismaDevicesMapper {
    static toDomain(raw) {
        return device_1.Device.create({
            name: raw.name,
            type: raw.type,
            operatingSystem: raw.operatingSystem || 'unknown',
            ipAddress: raw.ipAddress || 'unknown',
            browser: raw.browser || 'unknown',
            location: raw.location || 'unknown',
            lastLogin: raw.lastLogin,
            active: raw.active,
            userId: new unique_entity_id_1.UniqueEntityID(raw.userId)
        }, new unique_entity_id_1.UniqueEntityID(raw.id));
    }
    static toPrisma(device) {
        return {
            id: device.id.toString(),
            name: device.name,
            type: device.type,
            operatingSystem: device.operatingSystem,
            ipAddress: device.ipAddress,
            browser: device.browser,
            location: device.location,
            lastLogin: device.lastLogin,
            createdAt: device.createdAt,
            updatedAt: device.updatedAt,
            active: device.active,
            User: {
                connect: {
                    id: device.userId.toString()
                }
            }
        };
    }
}
exports.PrismaDevicesMapper = PrismaDevicesMapper;
