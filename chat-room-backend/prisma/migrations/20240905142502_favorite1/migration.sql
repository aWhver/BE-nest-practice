/*
  Warnings:

  - You are about to drop the column `favoriteId` on the `chatHistory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `chatHistory` DROP FOREIGN KEY `chatHistory_favoriteId_fkey`;

-- AlterTable
ALTER TABLE `chatHistory` DROP COLUMN `favoriteId`;

-- AlterTable
ALTER TABLE `favorite` MODIFY `content` VARCHAR(500) NULL DEFAULT '';

-- CreateTable
CREATE TABLE `favoriteChatHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `favoriteId` INTEGER NULL,
    `chatHistoryId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `favoriteChatHistory` ADD CONSTRAINT `favoriteChatHistory_favoriteId_fkey` FOREIGN KEY (`favoriteId`) REFERENCES `favorite`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoriteChatHistory` ADD CONSTRAINT `favoriteChatHistory_chatHistoryId_fkey` FOREIGN KEY (`chatHistoryId`) REFERENCES `chatHistory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
