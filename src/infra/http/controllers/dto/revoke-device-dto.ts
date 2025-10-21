import { IsOptional } from 'class-validator'

export class RevokeDeviceSessionDto {
  @IsOptional()
  deviceId?: string
}
