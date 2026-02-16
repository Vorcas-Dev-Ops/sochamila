"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEmailExists = exports.loginUser = exports.registerUser = void 0;
const auth_service_1 = require("./auth.service");
const asyncHandler_1 = require("../../utils/asyncHandler");
const validators_1 = require("../../utils/validators");
const response_1 = require("../../utils/response");
/* =====================================================
   REGISTER USER
===================================================== */
exports.registerUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validated = validators_1.registerSchema.parse(req.body);
    const { token, user } = await (0, auth_service_1.registerUserService)(validated);
    return (0, response_1.sendSuccess)(res, "Registration successful", {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    }, 201);
});
/* =====================================================
   LOGIN USER (ADMIN / CUSTOMER / VENDOR)
===================================================== */
exports.loginUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const validated = validators_1.loginSchema.parse(req.body);
        const { token, user } = await (0, auth_service_1.loginUserService)(validated.email, validated.password);
        return (0, response_1.sendSuccess)(res, "Login successful", {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error.message);
        throw error;
    }
});
/* =====================================================
   CHECK EMAIL EXISTS (AJAX)
   Used during registration
===================================================== */
exports.checkEmailExists = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = validators_1.checkEmailSchema.parse(req.body);
    const exists = await (0, auth_service_1.checkEmailExistsService)(email);
    return (0, response_1.sendSuccess)(res, "Email check completed", { exists });
});
