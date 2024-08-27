import { Inject, Injectable } from '@nestjs/common';
import { NODE_MAILER_TOKEN } from 'src/common/const';
import { Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}

  @Inject(NODE_MAILER_TOKEN)
  private transport: Transporter;

  sendEmail({ to, subject, html }) {
    const sender = this.configService.get('NODE_MAILER_AUTH_USER');
    this.transport.sendMail(
      {
        from: {
          name: '社交聊天',
          address: sender,
        },
        to,
        subject,
        html,
      },
      (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
        }
      },
    );
  }
}
