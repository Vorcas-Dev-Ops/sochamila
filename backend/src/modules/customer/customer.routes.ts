import { Router, Request, Response } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { Role } from "@prisma/client";
import {
  getCustomerProfile,
  getCustomerOrders,
  getCustomerStats,
} from "./customer.controller";

const router = Router();

/* =========================================================
   CUSTOMER ENDPOINTS (PROTECTED - CUSTOMER ROLE)
========================================================= */


/**
 * PUT /api/customer/profile
 * @description Update customer profile (name, email)
 * @requires CUSTOMER role
 */
router.put(
  "/profile",
  authMiddleware,
  roleMiddleware([Role.CUSTOMER]),
  (req: Request, res: Response) => require("./customer.controller").updateCustomerProfile(req, res)
);

/**
 * GET /api/customer/profile
 * @description Get customer profile
 * @requires CUSTOMER role
 * @returns Customer profile data
 */
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware([Role.CUSTOMER]),
  (req: Request, res: Response) => getCustomerProfile(req, res)
);

/**
 * GET /api/customer/orders
 * @description Get customer's orders
 * @requires CUSTOMER role
 * @returns Customer's orders with items
 */
router.get(
  "/orders",
  authMiddleware,
  roleMiddleware([Role.CUSTOMER]),
  (req: Request, res: Response) => getCustomerOrders(req, res)
);

/**
 * GET /api/customer/stats
 * @description Get customer statistics
 * @requires CUSTOMER role
 * @returns Customer stats (total orders, spending, etc.)
 */
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware([Role.CUSTOMER]),
  (req: Request, res: Response) => getCustomerStats(req, res)
);

export default router;
