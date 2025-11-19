import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare module "express" {
  export interface Request {
    userId?: string;
    userEmail?: string;
  }
}

const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
      console.error("❌ JWT Secret not set!");
      return res.status(500).json({ message: "Server error" });
    }

    // Verify token signature with backend's JWT secret
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Accept MongoDB ObjectId from microservices (userId field)
    const userId = decoded.userId || decoded.id;
    const userEmail = decoded.email;
    
    if (!userId) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Trust the token - user is authenticated by microservices
    req.userId = userId;
    req.userEmail = userEmail;
    
    next();
  } catch (error) {
    console.error("Token Verification Error:", error instanceof Error ? error.message : error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default userMiddleware;