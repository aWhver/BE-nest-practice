import { PartialType } from '@nestjs/mapped-types';
import { CreateMulterUploadDto } from './create-multer-upload.dto';

export class UpdateMulterUploadDto extends PartialType(CreateMulterUploadDto) {}
