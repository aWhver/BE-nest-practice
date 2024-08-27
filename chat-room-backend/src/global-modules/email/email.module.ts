import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { NODE_MAILER_TOKEN } from 'src/common/const';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';

@Global()
@Module({
  providers: [
    EmailService,
    {
      provide: NODE_MAILER_TOKEN,
      useFactory(configService: ConfigService) {
        const emailClient = createTransport({
          host: configService.get('NODE_MAILER_HOST'),
          port: +configService.get('NODE_MAILER_PORT'),
          secure: false,
          auth: {
            user: configService.get('NODE_MAILER_AUTH_USER'),
            pass: configService.get('NODE_MAILER_AUTH_PASS'),
          },
        });

        return emailClient;
      },
      inject: [ConfigService],
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
