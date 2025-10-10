-- AlterTable
ALTER TABLE `orders` ADD COLUMN `note` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `products_price_idx` ON `products`(`price`);

-- CreateIndex
CREATE INDEX `products_is_active_idx` ON `products`(`is_active`);
