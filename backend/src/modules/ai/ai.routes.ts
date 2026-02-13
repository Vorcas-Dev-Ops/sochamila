import { Router } from "express";
import { transformImage } from "./ai.controller";
import { generateAIImage } from "./ai.generate.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

/* ======================================================
   AI ROUTES
====================================================== */

// Image transformation (existing)
router.post("/transform", transformImage);

// AI Image Generation (SECURED ✅)
router.post("/generate", authMiddleware, generateAIImage);

export default router;
