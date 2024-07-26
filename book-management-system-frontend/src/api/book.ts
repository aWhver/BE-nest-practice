import { DELETE, GET, POST, PUT } from "../common/http";
import { BaseBook, Book, CreateBookForm } from "../page/home/types";

export const getBooks = (name?: string) => GET<Array<Book>>('/book/list', { name });

export const createBook = (book: CreateBookForm) => POST<BaseBook>('/book/create', book);

export const updateBook = (book: Book) => PUT<Book>('/book/update', book);

export const getBookDetail = (id: string) => GET<Book>(`/book/${id}`);

export const deleteBook = (id: string) => DELETE<string>(`/book/delete/${id}`);
