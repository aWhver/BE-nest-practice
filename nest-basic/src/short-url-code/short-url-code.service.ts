import { Inject, Injectable, forwardRef } from '@nestjs/common';
import * as base62 from 'base62';
import { ShortUrlCode } from './entities/short-url-code.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { ShortLongMapService } from 'src/short-long-map/short-long-map.service';

const generateRandomStr = function (len) {
  let str = '';
  for (let i = 0; i < len; i++) {
    const integer = (Math.random() * 62) | 0;
    str += base62.encode(integer);
  }
  return str;
};

@Injectable()
export class ShortUrlCodeService {
  @InjectRepository(ShortUrlCode)
  private shortUrlCodeRepository: Repository<ShortUrlCode>;

  @Inject(forwardRef(() => ShortLongMapService))
  private shortLongMapService: ShortLongMapService;

  async initCodes() {
    // const
    const tasks = Array.from({ length: 10 }).map(() => {
      return this.genarateCode();
    });
    Promise.all(tasks);
  }

  async genarateCode() {
    const str = generateRandomStr(6);
    const code = await this.shortUrlCodeRepository.findOneBy({
      code: str,
    });
    if (code) {
      return this.genarateCode();
    }
    const uniqueCode = new ShortUrlCode();
    uniqueCode.code = str;
    uniqueCode.status = 0;
    await this.shortUrlCodeRepository.insert(uniqueCode);
    return uniqueCode;
  }

  async findOne(options: FindOneOptions) {
    return this.shortUrlCodeRepository.findOne(options);
  }

  updateStatus(id: number, status: number) {
    this.shortUrlCodeRepository.update(id, {
      status,
    });
  }

  async getLongUrl(code: string) {
    const shortLongMap = await this.shortLongMapService.findLongUrlByCode(code);
    return shortLongMap.longUrl;
  }
}
