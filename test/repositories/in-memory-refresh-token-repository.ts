import { RefreshTokenRepository } from '@/domain/auth/application/repositories/refresh-token-repository';
import { RefreshToken } from '@/domain/auth/enterprise/entities/refresh-token';

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  public items: RefreshToken[] = [];

  async findById(id: string): Promise<RefreshToken | null> {
    const token = this.items.find((item) => item.id.toString() === id);
    return token || null;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = this.items.find((item) => item.token === token);
    return refreshToken || null;
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    return this.items.filter((item) => item.userId.toString() === userId);
  }

  async findByDeviceId(deviceId: string): Promise<RefreshToken[]> {
    return this.items.filter((item) => item.deviceId.toString() === deviceId);
  }

  async create(refreshToken: RefreshToken): Promise<void> {
    this.items.push(refreshToken);
  }

  async save(refreshToken: RefreshToken): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id === refreshToken.id
    );

    if (itemIndex >= 0) {
      this.items[itemIndex] = refreshToken;
    }
  }

  async delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id.toString() === id);

    if (itemIndex >= 0) {
      this.items.splice(itemIndex, 1);
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.items = this.items.filter((item) => item.userId.toString() !== userId);
  }

  async deleteByDeviceId(deviceId: string): Promise<void> {
    this.items = this.items.filter(
      (item) => item.deviceId.toString() !== deviceId
    );
  }
}
