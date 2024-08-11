import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

const sender = '13714040198@163.com';

@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: 'smtp.163.com',
      port: 25,
      secure: false,
      auth: {
        user: sender,
        pass: 'SLJZLILDAMQNGNMX', // 2024-08-11
      },
    });
  }

  sendMail({ to, subject, html }) {
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
