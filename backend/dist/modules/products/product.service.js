"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductsService = getAllProductsService;
exports.getProductByIdService = getProductByIdService;
exports.getProductsByCategoryService = getProductsByCategoryService;
const prisma_1 = require("../../config/prisma");
/**
 * Get all active products with variants
 */
async function getAllProductsService() {
    return prisma_1.prisma.product.findMany({
        where: { isActive: true },
        include: {
            variants: true,
        },
    });
}
/**
 * Get single product by ID
 */
async function getProductByIdService(productId) {
    return prisma_1.prisma.product.findUnique({
        where: { id: productId },
        include: {
            variants: true,
        },
    });
}
/**
 * Get products by category
 */
async function getProductsByCategoryService(category) {
    return prisma_1.prisma.product.findMany({
        where: {
            category,
            isActive: true,
        },
        include: {
            variants: true,
        },
    });
}
