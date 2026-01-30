import { Request, Response } from "express";
import {
  registerUserService,
  loginUserService,
  checkEmailExistsService,
} from "./auth.service";

/* =====================================================
   REGISTER USER
===================================================== */

export const registerUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const { token, user } = await registerUserService({
      name,
      email,
      password,
    });

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("REGISTER ERROR:", error);

    return res.status(400).json({
      message: error.message || "Registration failed",
    });
  }
};

/* =====================================================
   LOGIN USER (ADMIN / CUSTOMER / VENDOR)
===================================================== */

export const loginUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const { token, user } = await loginUserService(
      email,
      password
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);

    return res.status(401).json({
      message: error.message || "Invalid credentials",
    });
  }
};

/* =====================================================
   CHECK EMAIL EXISTS (AJAX)
   Used during registration
===================================================== */

export const checkEmailExists = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const exists = await checkEmailExistsService(email);

    return res.status(200).json({
      exists,
    });
  } catch (error) {
    console.error("CHECK EMAIL ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
