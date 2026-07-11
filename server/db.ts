import { eq, and, or, desc, lt, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  stores,
  products,
  coupons,
  wallets,
  walletTransactions,
  orders,
  orderItems,
  cartItems,
  Store,
  Product,
  Coupon,
  Wallet,
  Order,
  OrderItem,
  CartItem
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      let value = user[field];
      if (value === undefined) return;
      
      // Sanitize name to avoid charset issues with special characters/emojis
      if (field === "name" && typeof value === "string") {
        // Remove characters that might break standard UTF-8 (non-BMP characters like emojis)
        // unless the database is explicitly set to utf8mb4.
        // We'll replace them with a space or empty string to be safe.
        value = value.replace(/[^\u0000-\uFFFF]/g, "");
      }

      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ STORES ============

export async function createStore(data: {
  ownerId: number;
  name: string;
  slug: string;
  accentColor: string;
  whatsappNumber: string;
  description?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(stores).values({
    ownerId: data.ownerId,
    name: data.name,
    slug: data.slug,
    accentColor: data.accentColor,
    whatsappNumber: data.whatsappNumber,
    description: data.description,
    isActive: true,
  });
  return result;
}

export async function getStoreBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoreById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoresByOwner(ownerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(stores).where(eq(stores.ownerId, ownerId));
}

export async function getAllStores() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(stores).where(eq(stores.isActive, true));
}

export async function updateStore(id: number, data: Partial<Store>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(stores).set(data).where(eq(stores.id, id));
}

// ============ PRODUCTS ============

export async function createProduct(data: {
  storeId: number;
  name: string;
  description?: string;
  price: string;
  benefits?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(products).values({
    storeId: data.storeId,
    name: data.name,
    description: data.description,
    price: data.price,
    benefits: data.benefits || [],
    isActive: true,
  });
}

export async function getProductsByStore(storeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(products).where(
    and(eq(products.storeId, storeId), eq(products.isActive, true))
  );
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateProduct(id: number, data: Partial<Product>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(products).where(eq(products.id, id));
}

// ============ COUPONS ============

export async function createCoupon(data: {
  storeId: number;
  code: string;
  discountPercentage: number;
  maxUses?: number;
  expiresAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(coupons).values({
    storeId: data.storeId,
    code: data.code,
    discountPercentage: data.discountPercentage,
    maxUses: data.maxUses,
    expiresAt: data.expiresAt,
    currentUses: 0,
    isActive: true,
  });
}

export async function getCouponByCode(storeId: number, code: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(coupons).where(
    and(eq(coupons.storeId, storeId), eq(coupons.code, code))
  ).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getCouponById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCouponsByStore(storeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(coupons).where(eq(coupons.storeId, storeId));
}

export async function updateCoupon(id: number, data: Partial<Coupon>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(coupons).set(data).where(eq(coupons.id, id));
}

export async function deleteCoupon(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(coupons).where(eq(coupons.id, id));
}

// ============ WALLETS ============

export async function getOrCreateWallet(userId: number, storeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let wallet = await db.select().from(wallets).where(
    and(eq(wallets.userId, userId), eq(wallets.storeId, storeId))
  ).limit(1);

  if (wallet.length === 0) {
    await db.insert(wallets).values({
      userId,
      storeId,
      balance: "0",
    });
    wallet = await db.select().from(wallets).where(
      and(eq(wallets.userId, userId), eq(wallets.storeId, storeId))
    ).limit(1);
  }

  return wallet[0];
}

export async function getWallet(userId: number, storeId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(wallets).where(
    and(eq(wallets.userId, userId), eq(wallets.storeId, storeId))
  ).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function addWalletBalance(walletId: number, amount: string, description?: string, relatedOrderId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.transaction(async (tx) => {
    const wallet = await tx.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
    if (!wallet.length) throw new Error("Wallet not found");

    const newBalance = (parseFloat(wallet[0].balance) + parseFloat(amount)).toFixed(2);
    
    await tx.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, walletId));
    
    await tx.insert(walletTransactions).values({
      walletId,
      userId: wallet[0].userId,
      storeId: wallet[0].storeId,
      type: "credit",
      amount,
      description,
      relatedOrderId,
    });

    return { success: true, newBalance };
  });
}

export async function deductWalletBalance(walletId: number, amount: string, description?: string, relatedOrderId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.transaction(async (tx) => {
    const wallet = await tx.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
    if (!wallet.length) throw new Error("Wallet not found");

    const currentBalance = parseFloat(wallet[0].balance);
    const deductAmount = parseFloat(amount);

    if (currentBalance < deductAmount) {
      throw new Error("Insufficient balance");
    }

    const newBalance = (currentBalance - deductAmount).toFixed(2);
    
    await tx.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, walletId));
    
    await tx.insert(walletTransactions).values({
      walletId,
      userId: wallet[0].userId,
      storeId: wallet[0].storeId,
      type: "debit",
      amount,
      description,
      relatedOrderId,
    });

    return { success: true, newBalance };
  });
}

export async function getWalletTransactions(walletId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(walletTransactions)
    .where(eq(walletTransactions.walletId, walletId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(limit);
}

// ============ ORDERS ============

export async function createOrder(data: {
  storeId: number;
  userId: number;
  total: string;
  discountApplied?: string;
  couponCode?: string;
  items: Array<{ productId: number; quantity: number; price: string }>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.transaction(async (tx) => {
    const orderResult = await tx.insert(orders).values({
      storeId: data.storeId,
      userId: data.userId,
      total: data.total,
      discountApplied: data.discountApplied || "0",
      couponCode: data.couponCode,
      status: "pending",
      whatsappMessageSent: false,
    });

    const orderId = (orderResult as any).insertId || orderResult[0];

    for (const item of data.items) {
      await tx.insert(orderItems).values({
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    return orderId;
  });
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByStore(storeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orders)
    .where(eq(orders.storeId, storeId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersByUser(userId: number, storeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.storeId, storeId)))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function updateOrder(id: number, data: Partial<Order>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(orders).set(data).where(eq(orders.id, id));
}

// ============ CART ============

export async function addToCart(userId: number, storeId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(cartItems).where(
    and(
      eq(cartItems.userId, userId),
      eq(cartItems.storeId, storeId),
      eq(cartItems.productId, productId)
    )
  ).limit(1);

  if (existing.length > 0) {
    return await db.update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    return await db.insert(cartItems).values({
      userId,
      storeId,
      productId,
      quantity,
    });
  }
}

export async function getCartItems(userId: number, storeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.storeId, storeId)));
}

export async function updateCartItem(id: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (quantity <= 0) {
    return await removeFromCart(id);
  }

  return await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
}

export async function removeFromCart(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function clearCart(userId: number, storeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(cartItems).where(
    and(eq(cartItems.userId, userId), eq(cartItems.storeId, storeId))
  );
}
