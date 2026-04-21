import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('books')
@ApiBearerAuth()
@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Add a book' })
  create(@Body() dto: CreateBookDto, @Req() req: AuthenticatedRequest) {
    return this.booksService.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get books from my bookshelf' })
  findMyBooks(
    @Req() req: AuthenticatedRequest,
    @Query('bookshelfId') bookshelfId?: string,
  ) {
    const parsedBookshelfId = bookshelfId ? Number(bookshelfId) : undefined;
    return this.booksService.findMyBooks(req.user, parsedBookshelfId);
  }

  @ApiOperation({ summary: 'Get all users bookshelves (admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('all')
  findAll() {
    return this.booksService.findAll();
  }

  @ApiOperation({ summary: 'Update a book (owner or admin)' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.booksService.update(Number(id), dto, req.user);
  }

  @ApiOperation({ summary: 'Remove a book (owner or admin)' })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.booksService.remove(Number(id), req.user);
  }
}
