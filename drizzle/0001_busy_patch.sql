CREATE TABLE `cartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storeId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cartItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`discountPercentage` int NOT NULL,
	`maxUses` int,
	`currentUses` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupon_code_store_idx` UNIQUE(`storeId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`userId` int NOT NULL,
	`total` decimal(10,2) NOT NULL,
	`discountApplied` decimal(10,2) NOT NULL DEFAULT '0',
	`couponCode` varchar(50),
	`status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
	`whatsappMessageSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`benefits` json NOT NULL DEFAULT ('[]'),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`accentColor` varchar(7) NOT NULL DEFAULT '#3B82F6',
	`whatsappNumber` varchar(20) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stores_id` PRIMARY KEY(`id`),
	CONSTRAINT `stores_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `walletTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`userId` int NOT NULL,
	`storeId` int NOT NULL,
	`type` enum('credit','debit') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`description` text,
	`relatedOrderId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `walletTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storeId` int NOT NULL,
	`balance` decimal(10,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallet_user_store_idx` UNIQUE(`userId`,`storeId`)
);
--> statement-breakpoint
CREATE INDEX `cart_user_store_idx` ON `cartItems` (`userId`,`storeId`);--> statement-breakpoint
CREATE INDEX `cart_product_idx` ON `cartItems` (`productId`);--> statement-breakpoint
CREATE INDEX `coupon_store_idx` ON `coupons` (`storeId`);--> statement-breakpoint
CREATE INDEX `orderitem_order_idx` ON `orderItems` (`orderId`);--> statement-breakpoint
CREATE INDEX `orderitem_product_idx` ON `orderItems` (`productId`);--> statement-breakpoint
CREATE INDEX `order_store_idx` ON `orders` (`storeId`);--> statement-breakpoint
CREATE INDEX `order_user_idx` ON `orders` (`userId`);--> statement-breakpoint
CREATE INDEX `product_store_idx` ON `products` (`storeId`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `stores` (`slug`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `stores` (`ownerId`);--> statement-breakpoint
CREATE INDEX `transaction_wallet_idx` ON `walletTransactions` (`walletId`);--> statement-breakpoint
CREATE INDEX `transaction_user_idx` ON `walletTransactions` (`userId`);--> statement-breakpoint
CREATE INDEX `transaction_store_idx` ON `walletTransactions` (`storeId`);--> statement-breakpoint
CREATE INDEX `wallet_user_idx` ON `wallets` (`userId`);--> statement-breakpoint
CREATE INDEX `wallet_store_idx` ON `wallets` (`storeId`);