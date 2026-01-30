"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const router = (0, express_1.Router)();
// ✅ SPECIFIC routes FIRST
router.get("/category", product_controller_1.getProductsByCategory);
// ✅ GENERAL routes AFTER
router.get("/", product_controller_1.getAllProducts);
router.get("/:id", product_controller_1.getProductById);
exports.default = router;
