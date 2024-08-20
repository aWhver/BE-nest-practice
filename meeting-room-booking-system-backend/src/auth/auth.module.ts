import { Global, Module } from '@nestjs/common';
import { GithubStrategy } from './github.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';

@Global()
@Module({
  imports: [PassportModule, UserModule],
  providers: [GithubStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
