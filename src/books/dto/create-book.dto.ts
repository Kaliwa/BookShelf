import { BookStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title!: string;

  @IsString()
  author!: string;

  @IsEnum(BookStatus)
  status!: BookStatus;
}
