import { Inject, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PermissionService } from 'src/permission/permission.service';
import { Permission } from 'src/permission/entities/permission.entity';

@Injectable()
export class RoleService {
  @InjectRepository(Role)
  private roleRepository: Repository<Role>;

  @Inject(PermissionService)
  private permissionService: PermissionService;

  async create(createRoleDto: CreateRoleDto) {
    const role = new Role();
    role.name = createRoleDto.name;
    const existedPermissions = await this.permissionService.findByCodes(
      createRoleDto.permissionCodes,
    );
    const permissions = createRoleDto.permissionCodes.map((pCode) => {
      const existedP = existedPermissions.find(
        (ep) => ep.permissionCode === pCode,
      );
      if (existedP) {
        return existedP;
      }
      const permission = new Permission();
      permission.permissionCode = pCode;
      permission.name = `权限名${(Math.random() * 100).toFixed()}`;
      return permission;
    });
    role.permissions = permissions;
    await this.roleRepository.save(role);
    return '创建角色成功';
  }

  findAll() {
    return this.roleRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  findByRoleIds(roleIds: number[]) {
    return this.roleRepository.find({
      where: {
        id: In(roleIds),
      },
      relations: {
        permissions: true,
      },
    });
  }
}
