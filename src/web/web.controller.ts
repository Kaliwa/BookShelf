import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class WebController {
  private resolve(fileName: string) {
    return join(process.cwd(), 'public', fileName);
  }

  @Get()
  home(@Res() res: Response) {
    res.sendFile(this.resolve('index.html'));
  }

  @Get('login')
  login(@Res() res: Response) {
    res.sendFile(this.resolve('login.html'));
  }

  @Get('register')
  register(@Res() res: Response) {
    res.sendFile(this.resolve('register.html'));
  }

  @Get('books')
  books(@Res() res: Response) {
    res.sendFile(this.resolve('books.html'));
  }

  @Get('bookshelf')
  bookshelf(@Res() res: Response) {
    res.sendFile(this.resolve('bookshelf.html'));
  }
}
