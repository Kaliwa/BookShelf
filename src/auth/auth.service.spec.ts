import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    deleteById: jest.Mock;
    setTwoFactorCode: jest.Mock;
    clearTwoFactorCode: jest.Mock;
  };
  let mailService: {
    sendEmailVerificationEmail: jest.Mock;
    sendTwoFactorCodeEmail: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      deleteById: jest.fn(),
      setTwoFactorCode: jest.fn(),
      clearTwoFactorCode: jest.fn(),
    };
    mailService = {
      sendEmailVerificationEmail: jest.fn(),
      sendTwoFactorCodeEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: mailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deletes the created user when verification email sending fails', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({
      id: 1,
      email: 'alice@example.com',
      emailCode: '123456',
    });
    mailService.sendEmailVerificationEmail.mockRejectedValue(
      new Error('smtp error'),
    );

    await expect(
      service.register({
        email: 'alice@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(usersService.deleteById).toHaveBeenCalledWith(1);
  });

  it('clears the 2FA code when email sending fails during login', async () => {
    const passwordHash = await bcrypt.hash('123456', 10);

    usersService.findByEmail.mockResolvedValue({
      id: 1,
      email: 'alice@example.com',
      password: passwordHash,
      isEmailVerified: true,
    });
    usersService.setTwoFactorCode.mockResolvedValue({});
    mailService.sendTwoFactorCodeEmail.mockRejectedValue(
      new Error('smtp error'),
    );

    await expect(
      service.login({
        email: 'alice@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(usersService.clearTwoFactorCode).toHaveBeenCalledWith(1);
  });
});
