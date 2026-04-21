import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { BookshelfModule } from './bookshelf/bookshelf.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    BooksModule,
    BookshelfModule,
    PrismaModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
