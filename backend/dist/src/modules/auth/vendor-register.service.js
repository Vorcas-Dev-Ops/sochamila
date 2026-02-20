"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorRegisterService = vendorRegisterService;
const prisma_1 = require("../../config/prisma");
const hash_1 = require("../../utils/hash");
const jwt_1 = require("../../utils/jwt");
/* =====================================================
   VENDOR REGISTRATION SERVICE
===================================================== */
async function vendorRegisterService(data) {
    try {
        // 1️⃣ Check if email already exists
        const existingEmail = await prisma_1.prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (existingEmail) {
            throw new Error("Email already registered");
        }
        // 2️⃣ Check if Aadhaar already exists
        const existingAadhaar = await prisma_1.prisma.user.findUnique({
            where: { aadhaar: data.aadhaar },
        });
        if (existingAadhaar) {
            throw new Error("Aadhaar number already registered");
        }
        // 3️⃣ Check if PAN already exists
        const existingPan = await prisma_1.prisma.user.findUnique({
            where: { pan: data.pan },
        });
        if (existingPan) {
            throw new Error("PAN number already registered");
        }
        // 4️⃣ Validate payout method details
        if (data.payoutMethod === "BANK") {
            if (!data.accountNumber || !data.ifsc) {
                throw new Error("Bank details (account number and IFSC) are required for bank payout");
            }
        }
        else if (data.payoutMethod === "UPI") {
            if (!data.upiId) {
                throw new Error("UPI ID is required for UPI payout");
            }
        }
        // 5️⃣ Hash password
        const hashedPassword = await (0, hash_1.hashPassword)(data.password);
        // 6️⃣ Create vendor user
        const vendor = await prisma_1.prisma.user.create({
            data: {
                name: `${data.firstName} ${data.lastName}`,
                email: data.email.toLowerCase(),
                password: hashedPassword,
                role: "VENDOR",
                isActive: false, // Will be activated after KYC approval
                kycStatus: "PENDING",
                // Vendor personal info
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                phone: data.phone.trim(),
                vendorType: data.vendorType.trim(),
                // Vendor KYC documents
                aadhaar: data.aadhaar.trim(),
                pan: data.pan.trim(),
                gst: data.gst ? data.gst.trim() : null,
                // Vendor payout details
                payoutMethod: data.payoutMethod,
                accountNumber: data.accountNumber ? data.accountNumber.trim() : null,
                ifsc: data.ifsc ? data.ifsc.trim() : null,
                upiId: data.upiId ? data.upiId.trim() : null,
            },
        });
        // 7️⃣ Generate JWT token
        const token = (0, jwt_1.signToken)({
            id: vendor.id,
            role: vendor.role,
        });
        console.log("[VENDOR-REGISTER] Vendor registered successfully:", vendor.id);
        return {
            token,
            vendor: {
                id: vendor.id,
                email: vendor.email,
                role: vendor.role,
                kycStatus: vendor.kycStatus,
                firstName: vendor.firstName,
                lastName: vendor.lastName,
            },
        };
    }
    catch (error) {
        console.error("[VENDOR-REGISTER] Registration error:", error.message);
        throw error;
    }
}
