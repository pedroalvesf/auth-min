import { Device as PrismaDevice, Prisma } from '@/generated/prisma/client';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Device } from '@/domain/auth/enterprise/entities/device';

export class PrismaDevicesMapper {
  static toDomain(raw: PrismaDevice): Device {
    return Device.create(
      {
        name: raw.name,
        type: raw.type,
        operatingSystem: raw.operatingSystem || 'unknown',
        ipAddress: raw.ipAddress || 'unknown',
        browser: raw.browser || 'unknown',
        location: raw.location || 'unknown',
        lastLogin: raw.lastLogin,
        active: raw.active,
        userId: new UniqueEntityID(raw.userId),
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toPrisma(device: Device): Prisma.DeviceCreateInput {
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
          id: device.userId.toString(),
        },
      },
    };
  }
}
