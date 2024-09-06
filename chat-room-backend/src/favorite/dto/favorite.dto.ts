import { FavoriteType } from '@prisma/client';

export class AddFavoriteDto {
  /** "chatHistory" | "text" | "image" | "file" */
  type: FavoriteType;
  content?: string;
  chatHistoryIds?: number[];
}
