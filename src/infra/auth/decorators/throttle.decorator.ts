import { Throttle } from '@nestjs/throttler'

export const ThrottleAuth = () => Throttle([{ name: 'auth', limit: 5, ttl: 900000 }])

export const ThrottleStrict = () => Throttle([{ name: 'short', limit: 3, ttl: 1000 }])

export const ThrottleModerate = () => Throttle([{ name: 'medium', limit: 20, ttl: 60000 }])

export const ThrottleGenerous = () => Throttle([{ name: 'long', limit: 200, ttl: 3600000 }])