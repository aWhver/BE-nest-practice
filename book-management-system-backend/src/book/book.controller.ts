import {
  Body,
  Controller,
  Delete,
  Get,
  Optional,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage, fileFilter } from './multer';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('create')
  createBook(@Body() createBookDto: CreateBookDto) {
    console.log('createBookDto', createBookDto);
    return this.bookService.createBook(createBookDto);
  }

  @Put('update')
  BookUpdate(@Body() updateBookDto: UpdateBookDto) {
    return this.bookService.bookUpdate(updateBookDto);
  }

  @Get('list')
  bookList(@Optional() @Query('name') name: string) {
    return this.bookService.findList(name);
  }

  @Delete('delete/:id')
  bookDelete(@Param('id') id: string) {
    return this.bookService.bookDelete(id);
  }

  @Get(':id')
  findBookById(@Param('id') id: string) {
    return this.bookService.findOneById(id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: {
        fileSize: 3 << 19,
      },
    }),
  )
  coverUpload(@UploadedFile() file: Express.Multer.File) {
    // console.log('file', file);
    return file.path;
  }
}
