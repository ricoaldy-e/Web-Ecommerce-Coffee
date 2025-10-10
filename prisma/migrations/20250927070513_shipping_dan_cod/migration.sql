/*
  Warnings:

  - Added the required column `shipping_cost` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_method` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `shipping_cost` DECIMAL(12, 2) NOT NULL,
    ADD COLUMN `shipping_method` ENUM('JNE', 'JNT', 'SICEPAT') NOT NULL;

-- AlterTable
ALTER TABLE `payments` MODIFY `method` ENUM('CASH', 'COD', 'BANK_TRANSFER', 'EWALLET') NOT NULL;
