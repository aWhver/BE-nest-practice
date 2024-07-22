import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomDecoratorModule } from './custom-decorator/custom-decorator.module';

@Module({
  imports: [CustomDecoratorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
