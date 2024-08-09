import { Module } from '@nestjs/common';
import { QrcodeLoginController } from './qrcode-login.controller';

@Module({
  controllers: [QrcodeLoginController],
})
export class QrcodeLoginModule {}
