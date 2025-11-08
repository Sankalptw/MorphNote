import { Router, Request, Response } from "express";
import { z } from "zod";
import userMiddleware from "../middlware/middleware";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();
const noteRouter = Router();

noteRouter.post("/newnote", userMiddleware, async (req: Request, res: Response) => {
    try {
        const format = z.object({
            title: z.string(),
            desc: z.string()
        });

        const result = format.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: result.error.message });
        }

        const { title, desc } = result.data;
        const userId = (req as any).userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const newNote = await prisma.note.create({
            data: {
                title,
                desc,
                userId
            }
        });

        return res.status(201).json({
            message: "Note created successfully",
            note: newNote
        });

    } catch (e) {
        console.error("Error creating note:", e);
        return res.status(500).json({
            message: "Server error",
            error: e instanceof Error ? e.message : e
        });
    }
});

noteRouter.get("/my-notes", userMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const notes = await prisma.note.findMany({
            where: { userId }
        });
        
        res.json({ notes });

    } catch (e) {
        console.error("Error:", e);
        return res.status(500).json({
            message: "Server error",
            error: e instanceof Error ? e.message : e
        });
    }
});

noteRouter.delete("/note/:id", userMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Note ID required" });
        }

        const note = await prisma.note.findUnique({ where: { id } });
        
        if (!note || note.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await prisma.note.delete({ where: { id } });
        res.json({ message: "Note deleted" });

    } catch (e) {
        return res.status(500).json({ message: "Server error" });
    }
});

export default noteRouter;