import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateBookshelfDto {
  @ApiProperty({ example: 'Sci-Fi Shelf' })
  @IsString()
  @MinLength(3)
  name!: string;
}
