import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpException,
} from '@nestjs/common';
import { MulterUploadService } from './multer-upload.service';
import { CreateMulterUploadDto } from './dto/create-multer-upload.dto';
// import { UpdateMulterUploadDto } from './dto/update-multer-upload.dto';
import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { MyFileValidator } from './file.pipe';

const storage = multer.diskStorage({
  destination(req, file, callback) {
    try {
      fs.mkdirSync(path.join(process.cwd(), 'uploads'));
    } catch (error) {}
    callback(null, path.join(process.cwd(), 'uploads'));
  },
  filename(req, file, callback) {
    // file.originalname = Buffer.from(file.originalname, 'latin1').toString(
    //   'utf8',
    // );
    callback(null, Date.now() + file.originalname);
  },
});

const muloptions = {
  storage,
  // 解决中文乱码
  fileFilter(req, file, callback) {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );
    callback(null, true);
  },
};

@Controller('multer-upload')
export class MulterUploadController {
  constructor(private readonly multerUploadService: MulterUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', muloptions))
  create(
    @UploadedFile(
      'file',
      new ParseFilePipe({
        exceptionFactory(error) {
          throw new HttpException('error' + error, 500);
        },
        validators: [
          // 按照顺序依次校验，在第一个不通过的校验处停止抛出错误
          new FileTypeValidator({ fileType: 'image/jpeg' }),
          new MyFileValidator({}),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createMulterUploadDto: CreateMulterUploadDto,
  ) {
    console.log('file', file);
    console.log('createMulterUploadDto', createMulterUploadDto);
    return this.multerUploadService.create(createMulterUploadDto);
  }

  @Post('files')
  @UseInterceptors(FilesInterceptor('file', 4, muloptions))
  mulfiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
    @Body() createMulterUploadDto: CreateMulterUploadDto,
  ) {
    console.log('file', files);
    console.log('createMulterUploadDto', createMulterUploadDto);
    return '多文件上传';
  }

  @Post('filesByName')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'background', maxCount: 2 },
      ],
      muloptions,
    ),
  )
  mulFields(
    @UploadedFiles()
    files: {
      avatar: Express.Multer.File[];
      background: Express.Multer.File[];
    },
    @Body() createMulterUploadDto: CreateMulterUploadDto,
  ) {
    console.log('files', files);
    console.log('createMulterUploadDto', createMulterUploadDto);
    return 'cu';
  }
}
