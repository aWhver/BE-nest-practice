import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as qrcode from 'qrcode';
import { JwtService } from '@nestjs/jwt';

enum Status {
  noscan = 'noscan',
  'wait-scan-confirm' = 'wait-scan-confirm',
  'scan-confirm' = 'scan-confirm',
  'scan-cancel' = 'scan-cancel',
  expired = 'expired',
}

interface QrcodeInfo {
  status: Status;
  curTimastamp: number;
  expired: number;
  userInfo?: {
    id: number;
    username: string;
  };
}

const map = new Map<string, QrcodeInfo>();

const users = [
  {
    username: 'juntong',
    id: 1,
  },
  {
    username: 'inigo',
    id: 2,
  },
];

@Controller('qrcode')
export class QrcodeLoginController {
  constructor() {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Get('generate')
  async generateQrcode() {
    const uid = randomUUID();
    const url = `http://192.168.124.6:3102/static/scan-login/confirm.html?uid=${uid}`;
    const base64 = await qrcode.toDataURL(url);
    map.set(uid, {
      status: Status.noscan,
      curTimastamp: Date.now(),
      expired: 10 * 60,
    });
    return {
      uid,
      base64,
    };
  }

  @Get('check')
  check(@Query('id') id: string) {
    const qrcodeInfo = map.get(id);
    if (!qrcodeInfo) {
      throw new BadRequestException('该二维码已失效');
    }
    const isExpired =
      qrcodeInfo.expired * 1000 < Date.now() - qrcodeInfo.curTimastamp;
    if (isExpired) {
      map.delete(id);
      // throw new UnauthorizedException('该二维码已失效');
      return {
        status: Status.expired,
      };
    }

    return {
      status: qrcodeInfo.status,
      userInfo: qrcodeInfo.userInfo,
      token:
        qrcodeInfo.status === Status['scan-confirm']
          ? this.jwtService.sign({
              username: qrcodeInfo.userInfo.username,
            })
          : undefined,
    };
  }

  @Get('scan')
  waitConfirm(@Query('id') id: string) {
    const qrcodeInfo = this.getQrcodeInfo(id);
    qrcodeInfo.status = Status['wait-scan-confirm'];
    return '扫码成功';
  }

  @Get('confirm')
  async confirm(
    @Query('id') id: string,
    @Headers('Authorization') auth: string,
  ) {
    try {
      const [, token] = auth.split(' ');
      const userInfo = await this.jwtService.verify(token, {
        secret: 'tong',
      });
      const user = users.find((u) => (u.username = userInfo.username));
      const qrcodeInfo = this.getQrcodeInfo(id);
      if (user) {
        qrcodeInfo.userInfo = user;
      }
      qrcodeInfo.status = Status['scan-confirm'];
    } catch (error) {
      throw new UnauthorizedException('登录已失效');
    }

    return '登录确认';
  }

  @Get('cancel')
  cancel(@Query('id') id: string) {
    const qrcodeInfo = this.getQrcodeInfo(id);
    qrcodeInfo.status = Status['scan-cancel'];
    return '取消登录';
  }

  @Post('login')
  login(@Body('username') username: string) {
    const user = users.find((u) => u.username === username);
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    return this.jwtService.sign({
      username,
    });
  }

  getQrcodeInfo(id: string) {
    const qrcodeInfo = map.get(id);
    if (!qrcodeInfo) {
      throw new BadRequestException('该二维码已失效');
    }
    const isExpired =
      qrcodeInfo.expired * 1000 < Date.now() - qrcodeInfo.curTimastamp;
    if (isExpired) {
      map.delete(id);
      throw new UnauthorizedException('该二维码已失效');
    }

    return qrcodeInfo;
  }
}
