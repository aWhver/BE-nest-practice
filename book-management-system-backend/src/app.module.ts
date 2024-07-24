import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DbModuleModule } from './db-module/db-module.module';

@Module({
  imports: [UserModule, DbModuleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
