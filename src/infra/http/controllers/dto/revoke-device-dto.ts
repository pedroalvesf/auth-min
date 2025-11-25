import { IsNotEmpty, IsString } from 'class-validator';

export class RevokeDeviceSessionDto {
  @IsNotEmpty()
  @IsString()
  deviceId!: string;
}
