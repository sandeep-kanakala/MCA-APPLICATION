import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class MailUtils {
  private readonly logger = new Logger(MailUtils.name);
  private readonly transporter: nodemailer.Transporter<SentMessageInfo>;

  constructor(private readonly configService: ConfigService) {
    const mailHost = this.configService.get<string>('MAIL_HOST');
    const mailPort = this.configService.get<number>('MAIL_PORT');
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPass = this.configService.get<string>('MAIL_PASSWORD');

    if (!mailHost || !mailPort || !mailUser || !mailPass) {
      this.logger.error('Mail configuration is incomplete');
      throw new Error('Missing required mail configuration');
    }

    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 587,
      auth: {
        user: mailUser,
        pass: mailPass,
      },
      tls: { rejectUnauthorized: false },
    });
  }

  sendEmail(to: string, subject: string, html: string): void {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('MAIL_USER')!,
      to,
      subject,
      html,
    };
    this.transporter.sendMail(mailOptions).then(
      () => this.logger.log(`Email successfully sent to ${to}`),
      (error: Error) =>
        this.logger.error(`Failed to send email to ${to}: ${error.message}`),
    );
    this.logger.log(`Email sending initiated for ${to}`);
  }

  sendOtpEmail(email: string, otp: string): void {
    const subject = this.configService.get<string>('MAIL_SUBJECT_FORGOT');
    const text = this.configService.get<string>('MAIL_TEXT_FORGOT');

    if (!subject || !text) {
      throw new Error(
        'Email subject or text not defined in environment variables',
      );
    }

    const html = text.replace('{emailId}', email).replace('{otp}', otp);

    this.sendEmail(email, subject, html);
  }
}
