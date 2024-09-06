/*
  Warnings:

  - Added the required column `creatorId` to the `chatroom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `chatHistory` ADD COLUMN `favoriteId` INTEGER NULL;

-- AlterTable
ALTER TABLE `chatroom` ADD COLUMN `creatorId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `favorite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,
    `type` ENUM('image', 'file', 'text', 'chatHistory') NOT NULL DEFAULT 'text',
    `content` VARCHAR(200) NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chatHistory` ADD CONSTRAINT `chatHistory_favoriteId_fkey` FOREIGN KEY (`favoriteId`) REFERENCES `favorite`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
