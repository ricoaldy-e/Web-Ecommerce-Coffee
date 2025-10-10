/*
  Warnings:

  - A unique constraint covering the columns `[user_id,order_no]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_no` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `order_no` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `next_order_no` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX `orders_user_id_order_no_key` ON `orders`(`user_id`, `order_no`);
