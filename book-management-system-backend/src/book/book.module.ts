import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { DbModuleModule } from 'src/db-module/db-module.module';

@Module({
  imports: [
    DbModuleModule.register({
      path: 'book.json',
    }),
  ],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
