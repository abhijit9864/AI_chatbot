"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getCurrentUser = getCurrentUser;
const prisma_1 = require("../config/prisma");
const auth_service_1 = require("../services/auth.service");
async function register(req, res) {
    try {
        const result = await (0, auth_service_1.registerUser)(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Registration failed";
        res.status(400).json({
            message,
        });
    }
}
async function login(req, res) {
    try {
        const result = await (0, auth_service_1.loginUser)(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Login failed";
        res.status(401).json({
            message,
        });
    }
}
async function getCurrentUser(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                id: req.user.userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        return res.json({
            user,
        });
    }
    catch (error) {
        console.error("Get current user error:", error);
        return res.status(500).json({
            message: "Failed to get current user",
        });
    }
}
