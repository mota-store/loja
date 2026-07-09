ALTER TABLE `coupons` MODIFY COLUMN `currentUses` int NOT NULL;--> statement-breakpoint
ALTER TABLE `coupons` MODIFY COLUMN `isActive` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `whatsappMessageSent` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `benefits` json NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `isActive` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` MODIFY COLUMN `isActive` boolean NOT NULL;