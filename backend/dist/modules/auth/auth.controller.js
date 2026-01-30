"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const auth_service_1 = require("./auth.service");
const registerUser = async (req, res) => {
    try {
        const token = await (0, auth_service_1.registerUserService)(req.body);
        res.status(201).json({ token });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const token = await (0, auth_service_1.loginUserService)(req.body.email, req.body.password);
        res.json({ token });
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
};
exports.loginUser = loginUser;
