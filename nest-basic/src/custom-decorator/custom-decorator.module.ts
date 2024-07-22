import { Module } from '@nestjs/common';
import { CustomDecoratorService } from './custom-decorator.service';
import { CustomDecoratorController } from './custom-decorator.controller';

@Module({
  controllers: [CustomDecoratorController],
  providers: [CustomDecoratorService],
})
export class CustomDecoratorModule {}
