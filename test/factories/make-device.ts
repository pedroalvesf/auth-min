import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Device, DeviceProps } from '@/domain/auth/enterprise/entities/device';

let deviceCounter = 0;

export function makeDevice(
  override: Partial<DeviceProps> = {},
  id?: UniqueEntityID
) {
  deviceCounter++;

  const device = Device.create(
    {
      userId: new UniqueEntityID('user-1'),
      name: `Device ${deviceCounter}`,
      ipAddress: `192.168.1.${deviceCounter}`,
      browser: 'Chrome 120.0',
      operatingSystem: 'Windows 11',
      type: 'desktop',
      location: 'São Paulo, Brazil',
      active: true,
      ...override,
    },
    id
  );

  return device;
}
