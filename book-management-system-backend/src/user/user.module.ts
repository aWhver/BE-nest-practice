import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DbModuleModule } from 'src/db-module/db-module.module';
import { JwtModule } from '@nestjs/jwt';
import { SECRET } from 'src/constants';

@Module({
  imports: [
    DbModuleModule.register({
      path: 'user.json',
    }),
    JwtModule.register({
      global: true,
      secret: SECRET,
      signOptions: {
        expiresIn: '10h',
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
