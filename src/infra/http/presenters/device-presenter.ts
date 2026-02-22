import { formatDate } from '@/infra/utils/format-date';
import { Device } from '@/domain/auth/enterprise/entities/device';

export class DevicePresenter {
  static toHTTP(device: Device, currentSessionId: string) {
    return {
      id: device.id.toString(),
      deviceType: device.type,
      location:
        device.location === 'unknown' ? 'Unknown location' : device.location,
      lastLogin: formatDate(device.lastLogin),
      browser: device.browser,
      os: device.operatingSystem,
      currentSession: device.id.toString() === currentSessionId,
    };
  }
}
