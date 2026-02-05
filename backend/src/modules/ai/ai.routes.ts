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

// AI Image Generation
// TODO: Re-enable authMiddleware for production
// router.post("/generate", authMiddleware, generateAIImage);
router.post("/generate", generateAIImage); // Temporarily without auth for testing

export default router;
