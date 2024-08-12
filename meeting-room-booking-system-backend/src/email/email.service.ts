import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: configService.get('NODEMAILER_HOST'),
      port: configService.get('NODEMAILER_PORT'),
      secure: false,
      auth: {
        user: configService.get('NODEMAILER_AUTH_USER'),
        pass: configService.get('NODEMAILER_AUTH_PASS'), // 2024-08-11
      },
    });
  }

  sendMail({ to, subject, html }) {
    const sender = this.configService.get('NODEMAILER_AUTH_USER');
    this.transporter.sendMail(
      {
        from: {
          name: '会议室预定系统',
          address: sender,
        },
        to,
        subject,
        html,
      },
      (err, info) => {
        if (err) {
          console.log('err', err);
        } else {
          console.log('info', info);
        }
      },
    );
  }
}
