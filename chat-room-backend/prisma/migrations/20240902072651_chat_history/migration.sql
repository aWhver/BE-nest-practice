-- CreateTable
CREATE TABLE `ChatHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chatroomId` INTEGER NOT NULL,
    `sendUserId` INTEGER NOT NULL,
    `content` VARCHAR(500) NOT NULL,
    `type` ENUM('text', 'image', 'file') NOT NULL DEFAULT 'text',
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
