import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAuthDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
