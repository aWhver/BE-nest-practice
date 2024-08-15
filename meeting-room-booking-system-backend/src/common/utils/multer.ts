import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';

export const storage = multer.diskStorage({
  destination(req, file, callback) {
    // const filePath = path.join(process.cwd(), 'src/uploads');
    try {
      fs.mkdirSync('uploads');
    } catch (error) {}
    callback(null, 'uploads');
  },
  filename(req, file, callback) {
    const fileName = file.originalname;
    callback(null, fileName);
  },
});

export const fileFilter = (req, file, callback) => {
  file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
  const extname = path.extname(file.originalname);
  if (['.png', '.jpg', '.webp', '.jpeg'].includes(extname)) {
    callback(null, true);
  } else {
    callback(new BadRequestException('只能上传图片'), false);
  }
};
