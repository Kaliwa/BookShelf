import { ApiProperty } from '@nestjs/swagger';
import { BookStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBookDto {
  @ApiProperty({ example: 'The Great Gatsby' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'F. Scott Fitzgerald' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ example: 'TO_READ', enum: BookStatus })
  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  bookshelfId?: number;
}
