import { DevicesRepository } from '@/domain/auth/application/repositories/devices-repository';
import { Device } from '@/domain/auth/enterprise/entities/device';

export class InMemoryDevicesRepository implements DevicesRepository {
  public items: Device[] = [];

  async findById(id: string): Promise<Device | null> {
    const device = this.items.find((item) => item.id.toString() === id);
    return device || null;
  }

  async findByUserIdIp(
    userId: string,
    ipAddress: string
  ): Promise<Device | null> {
    const device = this.items.find(
      (item) =>
        item.userId.toString() === userId && item.ipAddress === ipAddress
    );
    return device || null;
  }

  async findByUserId(userId: string): Promise<Device[]> {
    return this.items.filter((item) => item.userId.toString() === userId);
  }

  async findManyByUserId(userId: string): Promise<Device[]> {
    return this.items.filter((item) => item.userId.toString() === userId);
  }

  async create(device: Device): Promise<void> {
    this.items.push(device);
  }

  async save(device: Device): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === device.id);

    if (itemIndex >= 0) {
      this.items[itemIndex] = device;
    }
  }

  async delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id.toString() === id);

    if (itemIndex >= 0) {
      this.items.splice(itemIndex, 1);
    }
  }
}
