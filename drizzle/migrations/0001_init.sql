CREATE TABLE `users` (
  `id` int AUTO_INCREMENT NOT NULL,
  `openId` varchar(64) NOT NULL UNIQUE,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `stores` (
  `id` int AUTO_INCREMENT NOT NULL,
  `ownerId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(100) NOT NULL UNIQUE,
  `accentColor` varchar(7) NOT NULL DEFAULT '#3B82F6',
  `whatsappNumber` varchar(20) NOT NULL,
  `description` text,
  `isActive` boolean NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `slug_idx` (`slug`),
  INDEX `owner_idx` (`ownerId`)
);

CREATE TABLE `products` (
  `id` int AUTO_INCREMENT NOT NULL,
  `storeId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `benefits` json NOT NULL,
  `isActive` boolean NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `product_store_idx` (`storeId`)
);

CREATE TABLE `coupons` (
  `id` int AUTO_INCREMENT NOT NULL,
  `storeId` int NOT NULL,
  `code` varchar(50) NOT NULL,
  `discountPercentage` int NOT NULL,
  `maxUses` int,
  `currentUses` int NOT NULL,
  `isActive` boolean NOT NULL,
  `expiresAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `coupon_store_idx` (`storeId`),
  UNIQUE KEY `coupon_code_store_idx` (`storeId`, `code`)
);

CREATE TABLE `wallets` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `storeId` int NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wallet_user_store_idx` (`userId`, `storeId`),
  INDEX `wallet_user_idx` (`userId`),
  INDEX `wallet_store_idx` (`storeId`)
);

CREATE TABLE `walletTransactions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `walletId` int NOT NULL,
  `userId` int NOT NULL,
  `storeId` int NOT NULL,
  `type` enum('credit','debit') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` text,
  `relatedOrderId` int,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `transaction_wallet_idx` (`walletId`),
  INDEX `transaction_user_idx` (`userId`),
  INDEX `transaction_store_idx` (`storeId`)
);

CREATE TABLE `orders` (
  `id` int AUTO_INCREMENT NOT NULL,
  `storeId` int NOT NULL,
  `userId` int NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `discountApplied` decimal(10,2) NOT NULL,
  `couponCode` varchar(50),
  `status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
  `whatsappMessageSent` boolean NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `order_store_idx` (`storeId`),
  INDEX `order_user_idx` (`userId`)
);

CREATE TABLE `orderItems` (
  `id` int AUTO_INCREMENT NOT NULL,
  `orderId` int NOT NULL,
  `productId` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `orderitem_order_idx` (`orderId`),
  INDEX `orderitem_product_idx` (`productId`)
);

CREATE TABLE `cartItems` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `storeId` int NOT NULL,
  `productId` int NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `cart_user_store_idx` (`userId`, `storeId`),
  INDEX `cart_product_idx` (`productId`)
);
