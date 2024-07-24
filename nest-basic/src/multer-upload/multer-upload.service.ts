import { Injectable } from '@nestjs/common';
import { CreateMulterUploadDto } from './dto/create-multer-upload.dto';
import { UpdateMulterUploadDto } from './dto/update-multer-upload.dto';

@Injectable()
export class MulterUploadService {
  create(createMulterUploadDto: CreateMulterUploadDto) {
    return 'This action adds a new multerUpload';
  }

  findAll() {
    return `This action returns all multerUpload`;
  }

  findOne(id: number) {
    return `This action returns a #${id} multerUpload`;
  }

  update(id: number, updateMulterUploadDto: UpdateMulterUploadDto) {
    return `This action updates a #${id} multerUpload`;
  }

  remove(id: number) {
    return `This action removes a #${id} multerUpload`;
  }
}
