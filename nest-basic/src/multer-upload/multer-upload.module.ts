import { Module } from '@nestjs/common';
import { MulterUploadService } from './multer-upload.service';
import { MulterUploadController } from './multer-upload.controller';

@Module({
  controllers: [MulterUploadController],
  providers: [MulterUploadService],
})
export class MulterUploadModule {}
