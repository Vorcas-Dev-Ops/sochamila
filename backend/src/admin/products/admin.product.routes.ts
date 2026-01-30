import { Router } from "express";
import multer from "multer";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateProductStatus,
  deleteProduct,
} from "./admin.product.controller";

const router = Router();

/* ---------- MULTER ---------- */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

/* ---------- ROUTES ---------- */
router.post("/", upload.array("images"), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", upload.array("images"), updateProduct);
router.patch("/:id/status", updateProductStatus);
router.delete("/:id", deleteProduct);

export default router;
