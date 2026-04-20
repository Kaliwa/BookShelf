import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateBookshelfDto {
  @ApiProperty({ example: 'Alice Cozy Shelf' })
  @IsString()
  @MinLength(3)
  name!: string;
}
