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
  @ApiOperation({ summary: 'Create a new book' })
  create(@Body() dto: CreateBookDto, @Req() req: AuthenticatedRequest) {
    return this.booksService.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Find books owned by the current user' })
  findMyBooks(@Req() req: AuthenticatedRequest) {
    return this.booksService.findMyBooks(req.user);
  }

  @ApiOperation({ summary: 'Find all books (admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('all')
  findAll() {
    return this.booksService.findAll();
  }

  @ApiOperation({ summary: 'Update a book (owner only)' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.booksService.update(Number(id), dto, req.user);
  }

  @ApiOperation({ summary: 'Delete a book (owner only)' })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.booksService.remove(Number(id), req.user);
  }
}
