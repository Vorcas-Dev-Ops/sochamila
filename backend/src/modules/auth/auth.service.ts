import { prisma } from "../../config/prisma";
import { hashPassword, comparePassword } from "../../utils/hash";
import { signToken } from "../../utils/jwt";

/* =====================================================
   TYPES
===================================================== */

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

/* =====================================================
   REGISTER USER
===================================================== */

export async function registerUserService(
  data: RegisterInput
) {
  // 1️⃣ Check existing email
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  // 2️⃣ Hash password
  const hashedPassword = await hashPassword(data.password);

  // 3️⃣ Create user
  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: "CUSTOMER",
      isActive: true,
    },
  });

  // 4️⃣ Generate JWT
  const token = signToken({
    id: user.id,
    role: user.role,
  });

  return { token, user };
}

/* =====================================================
   LOGIN USER
===================================================== */

export async function loginUserService(
  email: string,
  password: string
) {
  // 1️⃣ Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.isActive) {
    throw new Error("Invalid email or password");
  }

  // 2️⃣ Compare password
  const isPasswordValid = await comparePassword(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // 3️⃣ Generate token
  const token = signToken({
    id: user.id,
    role: user.role,
  });

  return { token, user };
}

/* =====================================================
   CHECK EMAIL EXISTS (AJAX SUPPORT)
===================================================== */

export async function checkEmailExistsService(
  email: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  return !!user;
}
