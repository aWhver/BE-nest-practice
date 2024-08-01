import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class PermissionService {
  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  create(createPermissionDto: CreatePermissionDto) {
    return 'This action adds a new permission';
  }

  findAll() {
    return this.permissionRepository.find();
    // return `This action returns all permission`;
  }

  async findOne(code: string) {
    const permission = await this.permissionRepository.findOneBy({
      permissionCode: code,
    });
    return permission;
  }

  async findByCodes(codes: string[]) {
    // const permissions = await this.permissionRepository.query(
    //   `SELECT * FROM permission where permissionCode in (${codes.join(',')})`,
    // );
    // const permissions = await this.permissionRepository.find({
    //   where: {
    //     permissionCode: In(codes),
    //   },
    // });
    const permissions = await this.permissionRepository.findBy({
      permissionCode: In(codes),
    });

    return permissions;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
}
