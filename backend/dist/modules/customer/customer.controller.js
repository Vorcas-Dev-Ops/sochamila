"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerProfile = getCustomerProfile;
exports.getCustomerOrders = getCustomerOrders;
exports.getCustomerStats = getCustomerStats;
const customer_service_1 = require("./customer.service");
/**
 * Get customer profile
 */
async function getCustomerProfile(req, res) {
    try {
        const customerId = req.user?.id;
        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const data = await (0, customer_service_1.getCustomerProfileService)(customerId);
        res.json({
            success: true,
            data,
        });
    }
    catch (error) {
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
async function getCustomerOrders(req, res) {
    try {
        const customerId = req.user?.id;
        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const data = await (0, customer_service_1.getCustomerOrdersService)(customerId);
        res.json({
            success: true,
            data,
        });
    }
    catch (error) {
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
async function getCustomerStats(req, res) {
    try {
        const customerId = req.user?.id;
        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const data = await (0, customer_service_1.getCustomerStatsService)(customerId);
        res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        console.error("[CUSTOMER] Error fetching stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch customer stats",
        });
    }
}
