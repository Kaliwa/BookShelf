import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

type AuthenticatedRequest = {
  user: Parameters<BooksService['create']>[1];
};

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  create(@Body() dto: CreateBookDto, @Req() req: AuthenticatedRequest) {
    return this.booksService.create(dto, req.user);
  }

  @Get()
  findMyBooks(@Req() req: AuthenticatedRequest) {
    return this.booksService.findMyBooks(req.user);
  }

  @Get('all')
  findAll(@Req() req: AuthenticatedRequest) {
    return this.booksService.findAll(req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.booksService.update(Number(id), dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.booksService.remove(Number(id), req.user);
  }
}
