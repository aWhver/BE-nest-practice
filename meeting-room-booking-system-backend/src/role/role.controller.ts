import { Controller } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('角色模块')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
}
