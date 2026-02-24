import { Throttle } from '@nestjs/throttler';

export const ThrottleAuth = () => Throttle({ auth: { limit: 5, ttl: 900000 } });

export const ThrottleStrict = () =>
  Throttle({ short: { limit: 3, ttl: 1000 } });

export const ThrottleModerate = () =>
  Throttle({ medium: { limit: 20, ttl: 60000 } });

export const ThrottleGenerous = () =>
  Throttle({ long: { limit: 200, ttl: 3600000 } });
