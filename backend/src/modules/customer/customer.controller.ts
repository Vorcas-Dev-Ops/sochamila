import { Request, Response } from "express";
import {
  getCustomerProfileService,
  getCustomerOrdersService,
  getCustomerStatsService,
} from "./customer.service";

/**
 * Get customer profile
 */
export async function getCustomerProfile(req: Request, res: Response) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await getCustomerProfileService(customerId);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[CUSTOMER] Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer profile",
    });
  }
}

/**
 * Get customer orders
 */
export async function getCustomerOrders(req: Request, res: Response) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await getCustomerOrdersService(customerId);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[CUSTOMER] Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer orders",
    });
  }
}

/**
 * Get customer stats
 */
export async function getCustomerStats(req: Request, res: Response) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await getCustomerStatsService(customerId);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[CUSTOMER] Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer stats",
    });
  }
}
