import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class PermissionService {
  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  findPermissions(options: FindOptionsWhere<Permission>) {
    return this.permissionRepository.find({
      where: options,
    });
  }
}
