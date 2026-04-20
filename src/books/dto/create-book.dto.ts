import { IsIn, IsString } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title!: string;

  @IsString()
  author!: string;

  @IsIn(['TO_READ', 'READING', 'DONE'])
  status!: 'TO_READ' | 'READING' | 'DONE';
}
