"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByCategory = exports.getProductById = exports.getAllProducts = void 0;
const product_service_1 = require("./product.service");
/**
 * GET /api/products
 */
const getAllProducts = async (req, res) => {
    try {
        const products = await (0, product_service_1.getAllProductsService)();
        res.status(200).json(products ?? []);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch products" });
    }
};
exports.getAllProducts = getAllProducts;
/**
 * GET /api/products/:id
 */
const getProductById = async (req, res) => {
    try {
        const product = await (0, product_service_1.getProductByIdService)(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch product" });
    }
};
exports.getProductById = getProductById;
/**
 * GET /api/products/category?category=Men
 */
const getProductsByCategory = async (req, res) => {
    try {
        const category = req.query.category;
        if (!category) {
            return res.status(400).json({ message: "Category is required" });
        }
        const products = await (0, product_service_1.getProductsByCategoryService)(category);
        res.status(200).json(products ?? []);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch products by category" });
    }
};
exports.getProductsByCategory = getProductsByCategory;
