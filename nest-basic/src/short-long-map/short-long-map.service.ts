import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ShortUrlCodeService } from 'src/short-url-code/short-url-code.service';
import { ShortLongMap } from './entities/short-long-map';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ShortLongMapService {
  @InjectRepository(ShortLongMap)
  private shortLongMapRepository: Repository<ShortLongMap>;

  @Inject(forwardRef(() => ShortUrlCodeService))
  private shortUrlCodeService: ShortUrlCodeService;

  async convertLongUrl(longUrl: string) {
    let uniqueCode = await this.shortUrlCodeService.findOne({
      where: {
        status: 0,
      },
    });
    console.log('uniqueCode', uniqueCode);
    if (!uniqueCode) {
      uniqueCode = await this.shortUrlCodeService.genarateCode();
    }
    const shortLongMap = new ShortLongMap();
    shortLongMap.longUrl = longUrl;
    shortLongMap.shortUrl = uniqueCode.code;
    this.shortUrlCodeService.updateStatus(uniqueCode.id, 1);
    this.shortLongMapRepository.insert(shortLongMap);
    return uniqueCode.code;
  }

  findLongUrlByCode(code: string) {
    return this.shortLongMapRepository.findOneBy({
      shortUrl: code,
    });
  }
}
