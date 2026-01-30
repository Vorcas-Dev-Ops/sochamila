import { Router } from "express";
import {
  getProducts,
  getProductById,
} from "./product.controller";

const router = Router();

/* ======================================================
   PUBLIC PRODUCT ROUTES
====================================================== */

// GET /api/products
router.get("/", getProducts);

// GET /api/products/:id
router.get("/:id", getProductById);

export default router;
