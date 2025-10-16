export interface LoginUserDto {
  email: string
  password: string
  deviceId: string
  ipAddress?: string
  userAgent?: string
}