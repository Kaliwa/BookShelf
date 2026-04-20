import { ApiProperty } from '@nestjs/swagger';
import { BookStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'The Great Gatsby' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'F. Scott Fitzgerald' })
  @IsString()
  author!: string;

  @ApiProperty({ example: 'TO_READ', enum: BookStatus })
  @IsEnum(BookStatus)
  status!: BookStatus;
}
