import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsIn(['TO_READ', 'READING', 'DONE'])
  status?: 'TO_READ' | 'READING' | 'DONE';
}
