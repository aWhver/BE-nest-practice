import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { PermissionModule } from 'src/permission/permission.module';
import { RabcUserModule } from 'src/rabc-user/rabc-user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), PermissionModule, RabcUserModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
