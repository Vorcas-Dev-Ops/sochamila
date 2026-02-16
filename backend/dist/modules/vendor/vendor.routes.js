"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const client_1 = require("@prisma/client");
const vendor_controller_1 = require("./vendor.controller");
const router = (0, express_1.Router)({ mergeParams: true, caseSensitive: false });
console.log("[VENDOR-ROUTES] Initializing vendor routes...");
// Debug middleware
router.use((req, res, next) => {
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
router.get("/health", (req, res) => {
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
router.get("/dashboard", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([client_1.Role.VENDOR, client_1.Role.ADMIN]), (req, res) => (0, vendor_controller_1.getVendorDashboard)(req, res));
/**
 * GET /api/vendor/orders
 * @description Get vendor's assigned orders
 * @requires VENDOR or ADMIN role
 * @returns Orders assigned to vendor
 */
router.get("/orders", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([client_1.Role.VENDOR, client_1.Role.ADMIN]), (req, res) => (0, vendor_controller_1.getVendorOrders)(req, res));
/**
 * GET /api/vendor/stats
 * @description Get vendor statistics
 * @requires VENDOR or ADMIN role
 * @returns Vendor stats
 */
router.get("/stats", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([client_1.Role.VENDOR, client_1.Role.ADMIN]), (req, res) => (0, vendor_controller_1.getVendorStats)(req, res));
/**
 * PATCH /api/vendor/orders/:orderId
 * @description Update vendor's order status
 * @requires VENDOR or ADMIN role
 * @body { status: string }
 * @returns Updated order
 */
router.patch("/orders/:orderId", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([client_1.Role.VENDOR, client_1.Role.ADMIN]), (req, res) => (0, vendor_controller_1.updateOrderStatus)(req, res));
/**
 * GET /api/vendor/assigned-designs
 * @description Get all designs assigned to this vendor
 * @requires VENDOR or ADMIN role
 * @returns Array of assigned items with design files (image, mockup, PDF)
 */
router.get("/assigned-designs", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([client_1.Role.VENDOR, client_1.Role.ADMIN]), (req, res) => (0, vendor_controller_1.getVendorAssignedDesigns)(req, res));
console.log("[VENDOR-ROUTES] Vendor routes initialized successfully");
exports.default = router;
