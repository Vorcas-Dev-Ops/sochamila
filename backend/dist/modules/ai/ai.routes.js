"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("./ai.controller");
const ai_generate_controller_1 = require("./ai.generate.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
/* ======================================================
   AI ROUTES
====================================================== */
// Image transformation (existing)
router.post("/transform", ai_controller_1.transformImage);
// AI Image Generation (SECURED ✅)
router.post("/generate", auth_middleware_1.authMiddleware, ai_generate_controller_1.generateAIImage);
exports.default = router;
