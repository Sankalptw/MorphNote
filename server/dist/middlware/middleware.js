"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
        const userId = decoded.userId || decoded.id;
        const userEmail = decoded.email;
        if (!userId) {
            return res.status(401).json({ message: "Invalid token format" });
        }
        req.userId = userId;
        req.userEmail = userEmail;
        next();
    }
    catch (error) {
        console.error("Token Verification Error:", error instanceof Error ? error.message : error);
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.default = userMiddleware;
//# sourceMappingURL=middleware.js.map