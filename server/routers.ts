import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ STORES ============
  stores: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
        accentColor: z.string().regex(/^#[0-9A-F]{6}$/i),
        whatsappNumber: z.string().min(1),
        description: z.string().optional(),
        homeContent: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const existing = await db.getStoreBySlug(input.slug);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Slug já existe" });
        
        return await db.createStore({
          ownerId: ctx.user.id,
          ...input,
        });
      }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getStoreBySlug(input.slug);
      }),
    
    getMyStores: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.getStoresByOwner(ctx.user.id);
      }),
    
    getAll: publicProcedure
      .query(async () => {
        return await db.getAllStores();
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        accentColor: z.string().optional(),
        whatsappNumber: z.string().optional(),
        description: z.string().optional(),
        homeContent: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const store = await db.getStoreById(input.id);
        if (!store || store.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return await db.updateStore(input.id, input);
      }),
  }),

  // ============ PRODUCTS ============
  products: router({
    create: protectedProcedure
      .input(z.object({
        storeId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.string(),
        imageUrl: z.string().optional(),
        benefits: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const store = await db.getStoreById(input.storeId);
        if (!store || store.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return await db.createProduct(input);
      }),
    
    getByStore: publicProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductsByStore(input.storeId);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        imageUrl: z.string().optional(),
        benefits: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const product = await db.getProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        
        const store = await db.getStoreById(product.storeId);
        if (!store || store.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return await db.updateProduct(input.id, input);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const product = await db.getProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        
        const store = await db.getStoreById(product.storeId);
        if (!store || store.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return await db.deleteProduct(input.id);
      }),
  }),

  // ============ WALLETS ============
  wallets: router({
    getBalance: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.getOrCreateWallet(ctx.user.id, input.storeId);
      }),
    
    getTransactions: protectedProcedure
      .input(z.object({ storeId: z.number(), limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const wallet = await db.getWallet(ctx.user.id, input.storeId);
        if (!wallet) return [];
        
        return await db.getWalletTransactions(wallet.id, input.limit);
      }),

    // Adicionar saldo (Apenas dono da loja)
    addBalance: protectedProcedure
      .input(z.object({
        storeId: z.number(),
        email: z.string().email(),
        amount: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const store = await db.getStoreById(input.storeId);
        if (!store || store.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas o dono da loja pode adicionar saldo." });
        }
        
        const targetUser = await db.getUserByEmail(input.email);
        if (!targetUser) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
        
        const wallet = await db.getOrCreateWallet(targetUser.id, input.storeId);
        
        return await db.addWalletTransaction({
          walletId: wallet.id,
          type: "deposit",
          amount: input.amount,
          description: input.description || "Depósito via Administrador",
        });
      }),
  }),

  // ============ USERS ============
  users: router({
    searchByEmail: protectedProcedure
      .input(z.object({ email: z.string() }))
      .query(async ({ input }) => {
        return await db.getUserByEmail(input.email);
      }),
  }),

  // ============ ORDERS ============
  orders: router({
    create: protectedProcedure
      .input(z.object({
        storeId: z.number(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          price: z.string(),
        })),
        total: z.string(),
        couponCode: z.string().optional(),
        discountApplied: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        return await db.createOrder({
          storeId: input.storeId,
          userId: ctx.user.id,
          total: input.total,
          couponCode: input.couponCode,
          discountApplied: input.discountApplied,
          items: input.items,
        });
      }),
    
    getByStore: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const store = await db.getStoreById(input.storeId);
        if (!store || store.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return await db.getOrdersByStore(input.storeId);
      }),
    
    getByUser: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.getOrdersByUser(ctx.user.id, input.storeId);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        return order;
      }),
    
    getItems: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return await db.getOrderItems(input.orderId);
      }),
  }),

  // ============ COUPONS ============
  coupons: router({
    create: protectedProcedure
      .input(z.object({
        storeId: z.number(),
        code: z.string().min(1),
        discountPercentage: z.number().min(1).max(100),
        maxUses: z.number().optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const store = await db.getStoreById(input.storeId);
        if (!store || store.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return await db.createCoupon(input);
      }),
    
    getByStore: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const store = await db.getStoreById(input.storeId);
        if (!store || store.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return await db.getCouponsByStore(input.storeId);
      }),
    
    validate: publicProcedure
      .input(z.object({ storeId: z.number(), code: z.string() }))
      .query(async ({ input }) => {
        const coupon = await db.getCouponByCode(input.storeId, input.code);
        
        if (!coupon) return { valid: false, error: "Cupom não encontrado" };
        if (!coupon.isActive) return { valid: false, error: "Cupom inativo" };
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          return { valid: false, error: "Cupom expirado" };
        }
        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
          return { valid: false, error: "Limite de usos atingido" };
        }
        
        return { valid: true, discount: coupon.discountPercentage };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        isActive: z.boolean().optional(),
        discountPercentage: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        // Verificar propriedade do cupom
        const coupon = await db.getCouponById(input.id);
        if (!coupon) throw new TRPCError({ code: "NOT_FOUND" });
        
        const store = await db.getStoreById(coupon.storeId);
        if (!store || store.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return await db.updateCoupon(input.id, input);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const coupon = await db.getCouponById(input.id);
        if (!coupon) throw new TRPCError({ code: "NOT_FOUND" });
        
        const store = await db.getStoreById(coupon.storeId);
        if (!store || store.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return await db.deleteCoupon(input.id);
      }),
  }),

  // ============ CART ============
  cart: router({
    addItem: protectedProcedure
      .input(z.object({
        storeId: z.number(),
        productId: z.number(),
        quantity: z.number().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.addToCart(ctx.user.id, input.storeId, input.productId, input.quantity);
      }),
    
    getItems: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.getCartItems(ctx.user.id, input.storeId);
      }),
    
    updateItem: protectedProcedure
      .input(z.object({ id: z.number(), quantity: z.number() }))
      .mutation(async ({ input }) => {
        return await db.updateCartItem(input.id, input.quantity);
      }),
    
    removeItem: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.removeFromCart(input.id);
      }),
    
    clear: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.clearCart(ctx.user.id, input.storeId);
      }),
  }),

  // ============ ADMIN ============
  admin: router({
    getAllStores: adminProcedure
      .query(async () => {
        return await db.getAllStores();
      }),
  }),
});

export type AppRouter = typeof appRouter;
