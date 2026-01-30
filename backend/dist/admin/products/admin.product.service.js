"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.getProductById = exports.getAllProducts = exports.updateProduct = exports.createProduct = void 0;
const prisma_1 = require("../../config/prisma");
/* =====================================================
   CREATE PRODUCT
===================================================== */
const createProduct = async (data) => {
    return prisma_1.prisma.product.create({
        data: {
            name: data.name,
            description: data.description ?? null,
            category: data.category,
            basePrice: data.basePrice,
            isActive: data.isActive,
            images: data.images ?? [],
            variants: {
                create: data.variants.map((v) => ({
                    color: v.color,
                    size: v.size,
                    price: v.price,
                    stock: v.stock,
                })),
            },
        },
        include: {
            variants: true,
        },
    });
};
exports.createProduct = createProduct;
/* =====================================================
   UPDATE PRODUCT
   - Replaces variants if provided
===================================================== */
const updateProduct = async (id, data) => {
    return prisma_1.prisma.product.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && {
                description: data.description,
            }),
            ...(data.category !== undefined && { category: data.category }),
            ...(data.basePrice !== undefined && {
                basePrice: data.basePrice,
            }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
            ...(data.images !== undefined && { images: data.images }),
            ...(data.variants && {
                variants: {
                    deleteMany: {}, // 🔥 remove old variants
                    create: data.variants.map((v) => ({
                        color: v.color,
                        size: v.size,
                        price: v.price,
                        stock: v.stock,
                    })),
                },
            }),
        },
        include: {
            variants: true,
        },
    });
};
exports.updateProduct = updateProduct;
/* =====================================================
   GET ALL PRODUCTS
===================================================== */
const getAllProducts = async () => {
    return prisma_1.prisma.product.findMany({
        include: {
            variants: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.getAllProducts = getAllProducts;
/* =====================================================
   GET PRODUCT BY ID
===================================================== */
const getProductById = async (id) => {
    return prisma_1.prisma.product.findUnique({
        where: { id },
        include: {
            variants: true,
        },
    });
};
exports.getProductById = getProductById;
/* =====================================================
   DELETE PRODUCT
===================================================== */
const deleteProduct = async (id) => {
    return prisma_1.prisma.product.delete({
        where: { id },
    });
};
exports.deleteProduct = deleteProduct;
