import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DbModuleModule } from 'src/db-module/db-module.module';

@Module({
  imports: [
    DbModuleModule.register({
      path: 'user.json',
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
