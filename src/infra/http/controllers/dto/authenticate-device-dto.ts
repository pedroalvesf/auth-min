import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthenticateDeviceDto {
  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsEmail()
  email!: string;
}
