import { Controller } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('权限模块')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}
}
