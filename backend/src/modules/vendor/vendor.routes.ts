import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { Role } from "@prisma/client";
import {
  getVendorDashboard,
  getVendorOrders,
  getVendorStats,
  updateOrderStatus,
  getVendorAssignedDesigns,
} from "./vendor.controller";

const router = Router({ mergeParams: true, caseSensitive: false });

console.log("[VENDOR-ROUTES] Initializing vendor routes...");

// Debug middleware
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[VENDOR-ROUTES] Request to ${req.path}:`, {
    method: req.method,
    originalUrl: req.originalUrl,
    path: req.path,
  });
  next();
});

/* =========================================================
   VENDOR ENDPOINTS (PROTECTED - VENDOR ROLE ONLY)
========================================================= */

/**
 * GET /api/vendor/health
 * @description Health check endpoint
 */
router.get("/health", (req: Request, res: Response) => {
  console.log("[VENDOR-ROUTES] Health check called");
  res.json({
    success: true,
    message: "Vendor routes are working",
  });
});

/**
 * GET /api/vendor/dashboard
 * @description Get vendor dashboard data
 * @requires VENDOR or ADMIN role
 * @returns Dashboard stats
 */
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware([Role.VENDOR, Role.ADMIN]),
  (req: Request, res: Response) => getVendorDashboard(req, res)
);

/**
 * GET /api/vendor/orders
 * @description Get vendor's assigned orders
 * @requires VENDOR or ADMIN role
 * @returns Orders assigned to vendor
 */
router.get(
  "/orders",
  authMiddleware,
  roleMiddleware([Role.VENDOR, Role.ADMIN]),
  (req: Request, res: Response) => getVendorOrders(req, res)
);

/**
 * GET /api/vendor/stats
 * @description Get vendor statistics
 * @requires VENDOR or ADMIN role
 * @returns Vendor stats
 */
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware([Role.VENDOR, Role.ADMIN]),
  (req: Request, res: Response) => getVendorStats(req, res)
);

/**
 * PATCH /api/vendor/orders/:orderId
 * @description Update vendor's order status
 * @requires VENDOR or ADMIN role
 * @body { status: string }
 * @returns Updated order
 */
router.patch(
  "/orders/:orderId",
  authMiddleware,
  roleMiddleware([Role.VENDOR, Role.ADMIN]),
  (req: Request, res: Response) => updateOrderStatus(req, res)
);

/**
 * GET /api/vendor/assigned-designs
 * @description Get all designs assigned to this vendor
 * @requires VENDOR or ADMIN role
 * @returns Array of assigned items with design files (image, mockup, PDF)
 */
router.get(
  "/assigned-designs",
  authMiddleware,
  roleMiddleware([Role.VENDOR, Role.ADMIN]),
  (req: Request, res: Response) => getVendorAssignedDesigns(req, res)
);

console.log("[VENDOR-ROUTES] Vendor routes initialized successfully");

export default router;
