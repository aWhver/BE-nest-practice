import { Module } from '@nestjs/common';
import { RabcUserService } from './rabc-user.service';
import { RabcUserController } from './rabc-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabcUser } from './entities/rabc-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RabcUser])],
  controllers: [RabcUserController],
  providers: [RabcUserService],
  exports: [RabcUserService],
})
export class RabcUserModule {}
