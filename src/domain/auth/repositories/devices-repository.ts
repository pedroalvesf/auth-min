import { Device } from "@/domain/auth/enterprise/entities/device";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export interface DevicesRepository {
  create(device: Device): Promise<void>;
  save(device: Device): Promise<void>;
  findById(deviceId: UniqueEntityID): Promise<Device | null>;
  findByUserId(userId: UniqueEntityID): Promise<Device[]>;
  findByUserIdIp(userId: string, ipAddress: string): Promise<Device | null>;
}
