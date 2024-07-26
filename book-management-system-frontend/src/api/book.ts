import { GET } from "../common/http";
import { Book } from "../page/home/types";

export const getBooks = (name?: string) => GET<Array<Book>>('/book/list', { name });
