import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  json,
  index,
  unique
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de lojas - cada loja é um inquilino (tenant)
 */
export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  accentColor: varchar("accentColor", { length: 7 }).default("#3B82F6").notNull(),
  whatsappNumber: varchar("whatsappNumber", { length: 20 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("slug_idx").on(table.slug),
  ownerIdx: index("owner_idx").on(table.ownerId),
}));

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

/**
 * Tabela de produtos - cada produto pertence a uma loja
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  benefits: json("benefits").$type<string[]>().notNull(),
  isActive: boolean("isActive").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeIdx: index("product_store_idx").on(table.storeId),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Tabela de cupons - cada cupom pertence a uma loja
 */
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  discountPercentage: int("discountPercentage").notNull(),
  maxUses: int("maxUses"),
  currentUses: int("currentUses").notNull(),
  isActive: boolean("isActive").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeIdx: index("coupon_store_idx").on(table.storeId),
  codeIdx: unique("coupon_code_store_idx").on(table.storeId, table.code),
}));

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

/**
 * Tabela de carteira/saldo - por usuário por loja
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  storeId: int("storeId").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userStoreIdx: unique("wallet_user_store_idx").on(table.userId, table.storeId),
  userIdx: index("wallet_user_idx").on(table.userId),
  storeIdx: index("wallet_store_idx").on(table.storeId),
}));

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Tabela de transações de carteira - histórico de movimentações
 */
export const walletTransactions = mysqlTable("walletTransactions", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull(),
  userId: int("userId").notNull(),
  storeId: int("storeId").notNull(),
  type: mysqlEnum("type", ["credit", "debit"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  relatedOrderId: int("relatedOrderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  walletIdx: index("transaction_wallet_idx").on(table.walletId),
  userIdx: index("transaction_user_idx").on(table.userId),
  storeIdx: index("transaction_store_idx").on(table.storeId),
}));

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = typeof walletTransactions.$inferInsert;

/**
 * Tabela de pedidos - cada pedido pertence a uma loja
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  userId: int("userId").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  discountApplied: decimal("discountApplied", { precision: 10, scale: 2 }).default("0").notNull(),
  couponCode: varchar("couponCode", { length: 50 }),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  whatsappMessageSent: boolean("whatsappMessageSent").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeIdx: index("order_store_idx").on(table.storeId),
  userIdx: index("order_user_idx").on(table.userId),
}));

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Tabela de itens do pedido
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  orderIdx: index("orderitem_order_idx").on(table.orderId),
  productIdx: index("orderitem_product_idx").on(table.productId),
}));

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Tabela de itens do carrinho
 */
export const cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  storeId: int("storeId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userStoreIdx: index("cart_user_store_idx").on(table.userId, table.storeId),
  productIdx: index("cart_product_idx").on(table.productId),
}));

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;