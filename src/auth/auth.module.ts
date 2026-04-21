import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailModule } from '../mail/mail.module';

const jwtExpirationSeconds = Number.parseInt(
  process.env.JWT_EXPIRATION_SECONDS ?? '3600',
  10,
);

@Module({
  imports: [
    UsersModule,
    MailModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-env',
      signOptions: {
        expiresIn: Number.isNaN(jwtExpirationSeconds)
          ? 3600
          : jwtExpirationSeconds,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
