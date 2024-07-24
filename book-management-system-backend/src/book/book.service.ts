import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { DbModuleService } from 'src/db-module/db-module.service';
import { Book } from './entities/book.entity';
import { UpdateBookDto } from './dto/update-book.dto';

const getId = function () {
  return Math.random().toString(36).slice(2);
};

@Injectable()
export class BookService {
  @Inject(DbModuleService)
  dbSrevice: DbModuleService;

  async createBook(createBookDto: CreateBookDto) {
    const books: Book[] = await this.dbSrevice.read();
    const book = new Book();
    book.id = getId();
    book.name = createBookDto.name;
    book.author = createBookDto.author;
    book.description = createBookDto.description;
    book.cover = createBookDto.cover;
    books.push(book);
    await this.dbSrevice.write(books);
    return book;
  }

  async bookUpdate(updateBookDto: UpdateBookDto) {
    const id = updateBookDto.id;
    const books: Book[] = await this.dbSrevice.read();
    const book = books.find((book: Book) => book.id === id);
    if (!book) {
      throw new BadRequestException('改书籍已被删除');
    }
    book.name = updateBookDto.name;
    book.author = updateBookDto.author;
    book.description = updateBookDto.description;
    book.cover = updateBookDto.cover;
    await this.dbSrevice.write(books);
    return book;
  }

  findAll() {
    return this.dbSrevice.read();
  }

  async findOneById(id: string) {
    const books = await this.findAll();
    const book = books.find((book: Book) => book.id === id);
    if (!book) {
      throw new BadRequestException('书籍不存在');
    }
    return book;
  }

  async bookDelete(id: string) {
    const books = await this.findAll();
    const newBooks = books.filter((book: Book) => book.id !== id);
    await this.dbSrevice.write(newBooks);
    return '删除成功';
  }
}
