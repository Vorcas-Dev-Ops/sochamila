import { Router } from "express";
import {
  getProducts,
  getProductById,
} from "./product.controller";

const productRouter = Router();

/* ======================================================
   PUBLIC PRODUCT ROUTES
====================================================== */

// GET /api/products
// Returns all active & available products
productRouter.get("/", getProducts);

// GET /api/products/:id
// Returns a single product by ID
productRouter.get("/:id", getProductById);

export default productRouter;
