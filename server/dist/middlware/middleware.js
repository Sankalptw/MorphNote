"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("../generated/prisma/client");
const prisma = new client_1.PrismaClient();
const userMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Token not found" });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Token not found" });
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("JWT Secret not set!");
            return res.status(500).json({ message: "Server error" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid user' });
        }
        req.userId = user.id;
        next();
    }
    catch (e) {
        console.error("Token Verification Error:", e);
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.default = userMiddleware;
//# sourceMappingURL=middleware.js.map