import { Router } from "express";
import adminRoutes from "../admin/admin.routes";
import productRoutes from "../modules/products/product.routes";
import graphicsRoutes from "../modules/graphics/graphics.routes";



const router = Router();

router.use("/admin", adminRoutes);
router.use("/products", productRoutes); // PUBLIC PRODUCTS
router.use("/graphics", graphicsRoutes);


export default router;
