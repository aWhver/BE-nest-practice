import { Module, forwardRef } from '@nestjs/common';
import { ShortLongMapService } from './short-long-map.service';
import { ShortLongMapController } from './short-long-map.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortLongMap } from './entities/short-long-map';
import { ShortUrlCodeModule } from 'src/short-url-code/short-url-code.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShortLongMap]),
    forwardRef(() => ShortUrlCodeModule),
  ],
  controllers: [ShortLongMapController],
  providers: [ShortLongMapService],
  exports: [ShortLongMapService],
})
export class ShortLongMapModule {}
