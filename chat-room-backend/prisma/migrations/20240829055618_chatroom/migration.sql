-- CreateTable
CREATE TABLE `chatroom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `type` ENUM('0', '1') NOT NULL DEFAULT '0',
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userChatroom` (
    `userId` INTEGER NOT NULL,
    `chatroomId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `chatroomId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `userChatroom` ADD CONSTRAINT `userChatroom_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userChatroom` ADD CONSTRAINT `userChatroom_chatroomId_fkey` FOREIGN KEY (`chatroomId`) REFERENCES `chatroom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
