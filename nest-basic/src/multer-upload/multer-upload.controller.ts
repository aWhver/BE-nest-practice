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
  Param,
  Get,
  Query,
  Inject,
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
import { MinioService } from 'src/minio/minio.service';

const storage = (dir = 'uploads') =>
  multer.diskStorage({
    destination(req, file, callback) {
      try {
        fs.mkdirSync(path.join(process.cwd(), dir));
      } catch (error) {}
      callback(null, path.join(process.cwd(), dir));
    },
    filename(req, file, callback) {
      // file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      //   'utf8',
      // );
      callback(null, Date.now() + file.originalname);
    },
  });

const muloptions = {
  storage: storage(),
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

  @Inject(MinioService)
  minioService: MinioService;

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

  // 文件切片上传
  @Post('sharding')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storage('uploads/tempSharding'),
      fileFilter(req, file, callback) {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString(
          'utf8',
        );
        callback(null, true);
      },
    }),
  )
  shardingUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
  ) {
    console.log('file', file);
    console.log('name', name);
    const newName = name.match(/(.+)\_\d+$/)[1];
    const chunksDir = `uploads/sharding/chunks_${newName}`;
    if (!fs.existsSync(chunksDir)) {
      fs.existsSync(chunksDir);
    }
    fs.cpSync(file.path, chunksDir + '/' + name);
    fs.rmSync(file.path);
  }
  // 合并切片
  @Get('merge')
  mergeSharding(@Query('name') name: string) {
    console.log('name', name);
    const dir = path.join(process.cwd(), `uploads/sharding/chunks_${name}`);
    const files = fs.readdirSync(dir).sort((a, b) => {
      return a.localeCompare(b);
    });
    let start = 0;
    let count = 0;
    files.map((file) => {
      // console.log('file', file);
      const filePath = `${dir}/${file}`;
      const stream = fs.createReadStream(filePath);
      stream
        .pipe(
          fs.createWriteStream(`uploads/${name}`, {
            start,
          }),
        )
        .on('finish', () => {
          count++;
          if (count === files.length) {
            fs.rm(
              `uploads/sharding/chunks_${name}`,
              { recursive: true },
              () => {},
            );
          }
        });
      start += fs.statSync(filePath).size;
    });
    // fs.rmdirSync(dir);

    return `uploads/${name}`;
  }

  // minio直传获取签名 url
  @Get('presignedUrl')
  upload(@Query('name') name: string) {
    return this.minioService.presignedPutObject('nest-basic', name);
  }
}
