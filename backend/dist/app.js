"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const app = (0, express_1.default)();
/* ================= GLOBAL MIDDLEWARES ================= */
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 🔥 REQUIRED FOR multipart/form-data
app.use(express_1.default.urlencoded({ extended: true }));
/* ================= STATIC FILES (VERY IMPORTANT) ================= */
// Serve uploaded images
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "..", "uploads")));
/* ================= API ROUTES ================= */
app.use("/api", routes_1.default);
/* ================= ERROR HANDLER ================= */
app.use(error_middleware_1.errorHandler);
exports.default = app;
