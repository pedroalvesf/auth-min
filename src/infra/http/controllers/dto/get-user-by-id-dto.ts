import { IsString, IsNotEmpty } from 'class-validator';

export class GetUserByIdDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
