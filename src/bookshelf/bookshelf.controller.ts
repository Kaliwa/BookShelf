import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BookshelfService } from './bookshelf.service';
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
  @ApiOperation({ summary: 'Get my bookshelf with all books' })
  getMyBookshelf(@Req() req: AuthenticatedRequest) {
    return this.bookshelfService.getMyBookshelf(req.user);
  }

  @Patch()
  @ApiOperation({ summary: 'Update my bookshelf name' })
  updateMyBookshelf(
    @Body() dto: UpdateBookshelfDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bookshelfService.updateMyBookshelf(req.user, dto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all bookshelves (admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.bookshelfService.findAll();
  }
}
