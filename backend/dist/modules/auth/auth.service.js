"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserService = registerUserService;
exports.loginUserService = loginUserService;
const prisma_1 = require("../../config/prisma");
const hash_1 = require("../../utils/hash");
const jwt_1 = require("../../utils/jwt"); // ⚠️ ensure correct path
async function registerUserService(data) {
    const hashed = await (0, hash_1.hashPassword)(data.password);
    const user = await prisma_1.prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashed,
        },
    });
    return (0, jwt_1.signToken)({
        id: user.id, // ✅ FIXED
        role: user.role,
    });
}
async function loginUserService(email, password) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    const isValid = await (0, hash_1.comparePassword)(password, user.password);
    if (!isValid) {
        throw new Error("Invalid credentials");
    }
    return (0, jwt_1.signToken)({
        id: user.id, // ✅ FIXED
        role: user.role,
    });
}
