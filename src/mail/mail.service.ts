import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor() {
    const host = process.env.MAIL_HOST;
    const port = Number(process.env.MAIL_PORT ?? 587);
    const secure = process.env.MAIL_SECURE === 'true';
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    this.from = process.env.MAIL_FROM ?? 'no-reply@bookshelf.local';

    if (!host || Number.isNaN(port)) {
      throw new ServiceUnavailableException(
        'Mail service is not configured. Set MAIL_HOST and MAIL_PORT.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendEmailVerificationEmail(to: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'BookShelf - verification de votre email',
      text: `Votre code de verification est: ${code}`,
      html: `<p>Votre code de verification est: <strong>${code}</strong></p>`,
    });
  }

  async sendTwoFactorCodeEmail(to: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'BookShelf - votre code 2FA',
      text: `Votre code de connexion est: ${code}`,
      html: `<p>Votre code de connexion est: <strong>${code}</strong></p>`,
    });
  }
}
