import { Device } from '@/domain/auth/enterprise/entities/device';

export abstract class DevicesRepository {
  abstract create(device: Device): Promise<void>;
  abstract save(device: Device): Promise<void>;
  abstract findById(deviceId: string): Promise<Device | null>;
  abstract findManyByUserId(userId: string): Promise<Device[]>;
  abstract findByUserIdIp(
    userId: string,
    ipAddress: string
  ): Promise<Device | null>;
}
