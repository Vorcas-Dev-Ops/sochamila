import { Router } from "express";
import { Role } from "@prisma/client";

import prisma from "../lib/prisma";

import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

// Products
import adminProductRoutes from "./products/admin.product.routes";

// Stickers + Categories
import adminStickerRoutes from "../modules/stickers/sticker.routes";
import adminStickerCategoryRoutes from "../modules/stickers/category.routes";

const router = Router();

/* =========================================================
   🔐 ADMIN AUTH GUARD (GLOBAL)
========================================================= */

router.use(authMiddleware);
router.use(roleMiddleware([Role.ADMIN]));

/* =========================================================
   📊 ADMIN DASHBOARD STATS (REAL-TIME)
========================================================= */

router.get("/stats", async (req, res) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalVendors,
      revenueResult,
    ] = await Promise.all([
      // Products count
      prisma.product.count(),

      // Orders except cancelled
      prisma.order.count({
        where: {
          status: {
            not: "CANCELLED",
          },
        },
      }),

      // Vendors
      prisma.user.count({
        where: {
          role: Role.VENDOR,
        },
      }),

      // Paid revenue
      prisma.order.aggregate({
        where: {
          paymentStatus: "PAID",
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    res.json({
      products: totalProducts,
      orders: totalOrders,
      vendors: totalVendors,
      revenue: revenueResult._sum.totalAmount || 0,
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    res.status(500).json({
      message: "Failed to load dashboard statistics",
    });
  }
});

/* =========================================================
   📦 ADMIN MODULE ROUTES
========================================================= */

// Products
router.use("/products", adminProductRoutes);

// Stickers
router.use("/stickers", adminStickerRoutes);

// Sticker Categories
router.use("/sticker-categories", adminStickerCategoryRoutes);

export default router;
