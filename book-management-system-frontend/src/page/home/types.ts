export interface BaseBook {
  name: string;
  author: string;
  description: string;
  cover: string;
}
export interface Book extends BaseBook {
  id: string;
}

export interface CreateBookForm extends BaseBook {}
