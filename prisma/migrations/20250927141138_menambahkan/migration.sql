/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `addresses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `addresses` DROP COLUMN `deleted_at`,
    ADD COLUMN `is_archived` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `addresses_user_id_is_default_is_archived_idx` ON `addresses`(`user_id`, `is_default`, `is_archived`);