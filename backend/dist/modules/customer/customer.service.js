"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerProfileService = getCustomerProfileService;
exports.getCustomerOrdersService = getCustomerOrdersService;
exports.getCustomerStatsService = getCustomerStatsService;
const prisma_1 = require("../../config/prisma");
/**
 * Get customer profile
 */
async function getCustomerProfileService(customerId) {
    const customer = await prisma_1.prisma.user.findUnique({
        where: { id: customerId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!customer) {
        throw new Error("Customer not found");
    }
    return customer;
}
/**
 * Get customer orders
 */
async function getCustomerOrdersService(customerId) {
    const orders = await prisma_1.prisma.order.findMany({
        where: { userId: customerId },
        include: {
            items: {
                include: {
                    size: {
                        include: {
                            color: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                    vendor: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    return orders.map((order) => ({
        id: order.id,
        orderId: order.id.slice(0, 8).toUpperCase(),
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
            id: item.id,
            product: item.size?.color?.product?.name,
            quantity: item.quantity,
            price: item.price,
            vendor: item.vendor?.name || "N/A",
            imageUrl: item.imageUrl,
            mockupUrl: item.mockupUrl,
        })),
    }));
}
/**
 * Get customer dashboard stats
 */
async function getCustomerStatsService(customerId) {
    const orders = await prisma_1.prisma.order.findMany({
        where: { userId: customerId },
    });
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const completedOrders = orders.filter((o) => o.status === "DELIVERED").length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    return {
        totalOrders,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        completedOrders,
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
    };
}
