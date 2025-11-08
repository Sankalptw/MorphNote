"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../generated/prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Middleware to extract userId from token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "No token" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
userRouter.post("/update-profile", authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, bio } = req.body;
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const user = await prisma.user.update({
            where: { id: userId },
            data: { firstName, lastName },
        });
        return res.json({ message: "Profile updated", user });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error updating profile" });
    }
});
userRouter.post("/change-password", authenticateToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const matchPass = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!matchPass)
            return res.status(401).json({ message: "Wrong password" });
        const hashedPass = await bcrypt_1.default.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPass },
        });
        return res.json({ message: "Password changed successfully" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error changing password" });
    }
});
exports.default = userRouter;
//# sourceMappingURL=user.js.map