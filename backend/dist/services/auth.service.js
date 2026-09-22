"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
function generateToken(userId, role) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return jsonwebtoken_1.default.sign({
        userId,
        role,
    }, secret, {
        expiresIn: "7d",
    });
}
async function registerUser(input) {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (!name || !email || !input.password) {
        throw new Error("Name, email and password are required");
    }
    if (input.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (existingUser) {
        throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt_1.default.hash(input.password, 12);
    const user = await prisma_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
    const token = generateToken(user.id, user.role);
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
}
async function loginUser(input) {
    const email = input.email.trim().toLowerCase();
    if (!email || !input.password) {
        throw new Error("Email and password are required");
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const passwordValid = await bcrypt_1.default.compare(input.password, user.password);
    if (!passwordValid) {
        throw new Error("Invalid email or password");
    }
    const token = generateToken(user.id, user.role);
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
}
