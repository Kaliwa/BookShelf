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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BookshelfService } from './bookshelf.service';
import { CreateBookshelfDto } from './dto/create-bookshelf.dto';
import { UpdateBookshelfDto } from './dto/update-bookshelf.dto';

interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('bookshelf')
@ApiBearerAuth()
@Controller('bookshelf')
@UseGuards(JwtAuthGuard)
export class BookshelfController {
  constructor(private readonly bookshelfService: BookshelfService) {}

  @Get()
  @ApiOperation({ summary: 'Get all my bookshelves with books' })
  getMyBookshelves(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
  ) {
    return this.bookshelfService.getMyBookshelves(req.user, search);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all bookshelves (admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll(@Query('search') search?: string) {
    return this.bookshelfService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of my bookshelves' })
  getMyBookshelf(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.bookshelfService.getMyBookshelfById(Number(id), req.user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a bookshelf' })
  createMyBookshelf(
    @Body() dto: CreateBookshelfDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bookshelfService.createMyBookshelf(req.user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one of my bookshelves name' })
  updateMyBookshelf(
    @Param('id') id: string,
    @Body() dto: UpdateBookshelfDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bookshelfService.updateMyBookshelf(Number(id), req.user, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete one bookshelf (owner or admin)' })
  removeBookshelf(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.bookshelfService.removeBookshelf(Number(id), req.user);
  }
}
