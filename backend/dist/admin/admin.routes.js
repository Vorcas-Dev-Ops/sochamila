"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const admin_product_routes_1 = __importDefault(require("./products/admin.product.routes"));
const router = (0, express_1.Router)();
// 🔐 PROTECT ALL ADMIN ROUTES
router.use(auth_middleware_1.authMiddleware);
router.use((0, role_middleware_1.roleMiddleware)([client_1.Role.ADMIN]));
// 📦 ADMIN PRODUCTS
router.use("/products", admin_product_routes_1.default);
exports.default = router;
