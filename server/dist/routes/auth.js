"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = __importDefault(require("zod"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
authRouter.post("/register", async (req, res) => {
    try {
        const format = zod_1.default.object({
            email: zod_1.default.string().email(),
            password: zod_1.default.string().min(3),
            firstName: zod_1.default.string().min(1),
            lastName: zod_1.default.string().min(1),
            role: zod_1.default.enum(["student", "professor", "admin", "Engineer", "Others"]),
        });
        const result = format.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: result.error.message });
        }
        const { email, password, firstName, lastName, role } = result.data;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        const hashPass = await bcrypt_1.default.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashPass,
                firstName,
                lastName,
                role,
            },
            select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
        });
        return res.status(201).json({
            message: "User registered",
            user: newUser,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});
authRouter.post("/login", async (req, res) => {
    try {
        const format = zod_1.default.object({
            email: zod_1.default.string().email(),
            password: zod_1.default.string().min(3),
        });
        const result = format.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: result.error.message });
        }
        const { email, password } = result.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const matchPass = await bcrypt_1.default.compare(password, user.password);
        if (!matchPass) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.default = authRouter;
//# sourceMappingURL=auth.js.map