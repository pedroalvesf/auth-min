import { DevicesRepository } from '@/domain/auth/application/repositories/devices-repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Device } from '@/domain/auth/enterprise/entities/device';
import { PrismaDevicesMapper } from '@/infra/database/prisma/mappers/prisma-devices-mapper';

@Injectable()
export class PrismaDevicesRepository implements DevicesRepository {
  constructor(private prisma: PrismaService) {}

  async findByUserIdIp(
    userId: string,
    ipAddress: string
  ): Promise<Device | null> {
    const device = await this.prisma.device.findFirst({
      where: { userId, ipAddress },
    });

    return device ? PrismaDevicesMapper.toDomain(device) : null;
  }

  async create(device: Device): Promise<void> {
    await this.prisma.device.create({
      data: PrismaDevicesMapper.toPrisma(device),
    });
  }

  async save(device: Device): Promise<void> {
    await this.prisma.device.update({
      where: { id: device.id.toString() },
      data: PrismaDevicesMapper.toPrisma(device),
    });
  }

  async findById(deviceId: string): Promise<Device | null> {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      return null;
    }

    return PrismaDevicesMapper.toDomain(device);
  }

  async findManyByUserId(userId: string): Promise<Device[]> {
    const devices = await this.prisma.device.findMany({
      where: { userId, active: true },
    });

    return devices.map(PrismaDevicesMapper.toDomain);
  }
}
