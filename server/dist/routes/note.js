"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const middleware_1 = __importDefault(require("../middlware/middleware"));
const client_1 = require("../generated/prisma/client");
const prisma = new client_1.PrismaClient();
const noteRouter = (0, express_1.Router)();
noteRouter.post("/newnote", middleware_1.default, async (req, res) => {
    try {
        const format = zod_1.z.object({
            title: zod_1.z.string(),
            desc: zod_1.z.string()
        });
        const result = format.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: result.error.message });
        }
        const { title, desc } = result.data;
        const userId = req.userId;
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
    }
    catch (e) {
        console.error("Error creating note:", e);
        return res.status(500).json({
            message: "Server error",
            error: e instanceof Error ? e.message : e
        });
    }
});
noteRouter.get("/my-notes", middleware_1.default, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const notes = await prisma.note.findMany({
            where: { userId }
        });
        res.json({ notes });
    }
    catch (e) {
        console.error("Error:", e);
        return res.status(500).json({
            message: "Server error",
            error: e instanceof Error ? e.message : e
        });
    }
});
noteRouter.delete("/note/:id", middleware_1.default, async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (e) {
        return res.status(500).json({ message: "Server error" });
    }
});
exports.default = noteRouter;
//# sourceMappingURL=note.js.map