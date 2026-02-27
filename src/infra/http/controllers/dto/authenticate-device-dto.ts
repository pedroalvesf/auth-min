import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthenticateDeviceDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
