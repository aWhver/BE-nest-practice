import { Module, forwardRef } from '@nestjs/common';
import { ShortUrlCodeService } from './short-url-code.service';
import { ShortUrlCodeController } from './short-url-code.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortUrlCode } from './entities/short-url-code.entity';
import { ShortLongMapModule } from 'src/short-long-map/short-long-map.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShortUrlCode]),
    forwardRef(() => ShortLongMapModule),
  ],
  controllers: [ShortUrlCodeController],
  providers: [ShortUrlCodeService],
  exports: [ShortUrlCodeService],
})
export class ShortUrlCodeModule {}
