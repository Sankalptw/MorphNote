import { Router } from "express";
import z from "zod";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authRouter = Router();
const prisma = new PrismaClient();

authRouter.post("/register", async (req, res) => {
    try {
        const format = z.object({
            email: z.string().email(),
            password: z.string().min(3),
            firstName: z.string().min(1),
            lastName: z.string().min(1),
            role: z.enum(["student", "professor", "admin", "Engineer", "Others"]),
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

        const hashPass = await bcrypt.hash(password, 10);

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
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const format = z.object({
            email: z.string().email(),
            password: z.string().min(3),
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

        const matchPass = await bcrypt.compare(password, user.password);
        if (!matchPass) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );

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
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Server error" });
    }
});

export default authRouter;