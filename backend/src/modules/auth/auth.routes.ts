import { Router } from "express";
import {
  registerUser,
  loginUser,
  checkEmailExists,
} from "./auth.controller";

const router = Router();

/* =====================================================
   AUTH ROUTES
===================================================== */

/**
 * POST /api/auth/register
 * Public
 */
router.post("/register", registerUser);

/**
 * POST /api/auth/login
 * Public (Admin + Customer + Vendor)
 */
router.post("/login", loginUser);

/**
 * POST /api/auth/check-email
 * Public
 * Used for AJAX validation during registration
 */
router.post("/check-email", checkEmailExists);

export default router;
