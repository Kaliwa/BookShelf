import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'alice@test.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @MinLength(6)
  password!: string;
}
