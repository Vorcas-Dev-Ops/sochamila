"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const productService = __importStar(require("./admin.product.service"));
/* =====================================================
   CREATE PRODUCT (MULTIPLE IMAGES + VARIANTS)
===================================================== */
const createProduct = async (req, res) => {
    try {
        const { name, description, category, basePrice, isActive } = req.body;
        /* ---------- BASIC VALIDATION ---------- */
        if (!name || !category || basePrice === undefined) {
            return res.status(400).json({
                message: "Name, category and base price are required",
            });
        }
        /* ---------- PARSE VARIANTS SAFELY ---------- */
        let variants = [];
        if (req.body.variants) {
            try {
                variants =
                    typeof req.body.variants === "string"
                        ? JSON.parse(req.body.variants)
                        : req.body.variants;
            }
            catch {
                return res.status(400).json({
                    message: "Invalid variants format (must be valid JSON)",
                });
            }
        }
        if (!Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({
                message: "At least one product variant is required",
            });
        }
        /* ---------- MULTIPLE IMAGE HANDLING ---------- */
        const files = req.files;
        const images = files?.map((file) => file.path.replace(/\\/g, "/")) ?? [];
        /* ---------- CREATE PRODUCT ---------- */
        const product = await productService.createProduct({
            name,
            description,
            category,
            basePrice: Number(basePrice),
            isActive: isActive === "true" || isActive === true,
            images, // ✅ MULTIPLE IMAGES
            variants,
        });
        return res.status(201).json(product);
    }
    catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);
        return res.status(500).json({
            message: error.message || "Product creation failed",
        });
    }
};
exports.createProduct = createProduct;
/* =====================================================
   GET ALL PRODUCTS
===================================================== */
const getAllProducts = async (_req, res) => {
    try {
        const products = await productService.getAllProducts();
        return res.json(products);
    }
    catch (error) {
        console.error("GET PRODUCTS ERROR:", error);
        return res.status(500).json({
            message: error.message || "Failed to fetch products",
        });
    }
};
exports.getAllProducts = getAllProducts;
/* =====================================================
   GET PRODUCT BY ID
===================================================== */
const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.json(product);
    }
    catch (error) {
        console.error("GET PRODUCT ERROR:", error);
        return res.status(500).json({
            message: error.message || "Failed to fetch product",
        });
    }
};
exports.getProductById = getProductById;
/* =====================================================
   UPDATE PRODUCT
===================================================== */
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        /* ---------- PARSE VARIANTS IF SENT ---------- */
        let variants;
        if (req.body.variants) {
            try {
                variants =
                    typeof req.body.variants === "string"
                        ? JSON.parse(req.body.variants)
                        : req.body.variants;
            }
            catch {
                return res.status(400).json({
                    message: "Invalid variants format",
                });
            }
        }
        /* ---------- IMAGE UPDATE (OPTIONAL) ---------- */
        const files = req.files;
        const images = files?.map((f) => f.path.replace(/\\/g, "/"));
        const updatedProduct = await productService.updateProduct(id, {
            ...req.body,
            ...(variants && { variants }),
            ...(images && { images }),
        });
        return res.json(updatedProduct);
    }
    catch (error) {
        console.error("UPDATE PRODUCT ERROR:", error);
        return res.status(500).json({
            message: error.message || "Product update failed",
        });
    }
};
exports.updateProduct = updateProduct;
/* =====================================================
   DELETE PRODUCT
===================================================== */
const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        return res.json({ message: "Product deleted successfully" });
    }
    catch (error) {
        console.error("DELETE PRODUCT ERROR:", error);
        return res.status(500).json({
            message: error.message || "Product deletion failed",
        });
    }
};
exports.deleteProduct = deleteProduct;
