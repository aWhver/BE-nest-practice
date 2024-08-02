import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleGuard } from 'src/common/guard';
import { ROLE_PERMISSION } from 'src/common/const';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(RoleGuard)
  @Post('create')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get('rolePermissionOne')
  @UseGuards(RoleGuard)
  @SetMetadata(ROLE_PERMISSION, ['1', '2', '3', '14'])
  roleOne() {
    return '这个接口只有拥有权限码1,2,3,14其中的一个的才可以访问';
  }

  @Get('rolePermissionTwo')
  @UseGuards(RoleGuard)
  @SetMetadata(ROLE_PERMISSION, ['15'])
  roleTwo() {
    return '这个接口只有拥有权限码15的才可以访问';
  }
}
