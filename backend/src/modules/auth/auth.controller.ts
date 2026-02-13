import { Request, Response } from "express";
import {
  registerUserService,
  loginUserService,
  checkEmailExistsService,
} from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { registerSchema, loginSchema, checkEmailSchema } from "../../utils/validators";
import { sendSuccess, sendError } from "../../utils/response";

/* =====================================================
   REGISTER USER
===================================================== */

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const validated = registerSchema.parse(req.body);

  const { token, user } = await registerUserService(validated as any);

  return sendSuccess(
    res,
    "Registration successful",
    {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    },
    201
  );
});

/* =====================================================
   LOGIN USER (ADMIN / CUSTOMER / VENDOR)
===================================================== */

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);

    const { token, user } = await loginUserService(validated.email, validated.password);

    return sendSuccess(res, "Login successful", {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error.message);
    throw error;
  }
});

/* =====================================================
   CHECK EMAIL EXISTS (AJAX)
   Used during registration
===================================================== */

export const checkEmailExists = asyncHandler(async (req: Request, res: Response) => {
  const { email } = checkEmailSchema.parse(req.body);

  const exists = await checkEmailExistsService(email);
  return sendSuccess(res, "Email check completed", { exists });
});
