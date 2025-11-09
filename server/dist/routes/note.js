"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const middleware_1 = __importDefault(require("../middlware/middleware"));
const client_1 = require("@prisma/client");
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
noteRouter.get("/note/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Note ID required" });
        }
        const note = await prisma.note.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                desc: true,
                createdAt: true,
                updatedAt: true
            },
        });
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        return res.json({ note });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error fetching note" });
    }
});
noteRouter.put("/note/:id", middleware_1.default, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { title, desc } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Note ID required" });
        }
        const note = await prisma.note.findUnique({ where: { id } });
        if (!note || note.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const updatedNote = await prisma.note.update({
            where: { id },
            data: { title, desc },
        });
        res.json({ message: "Note updated", note: updatedNote });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error updating note" });
    }
});
// ===== UPDATE NOTE FOLDER =====
noteRouter.put("/notes/:noteId/folder", middleware_1.default, async (req, res) => {
    try {
        const userId = req.userId;
        const { noteId } = req.params;
        const { folderId } = req.body;
        if (!noteId) {
            return res.status(400).json({ message: "Note ID required" });
        }
        const note = await prisma.note.findUnique({ where: { id: noteId } });
        if (!note || note.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const updatedNote = await prisma.note.update({
            where: { id: noteId },
            data: { folderId: folderId || null },
        });
        res.json({ message: "Note folder updated", note: updatedNote });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error updating note folder" });
    }
});
// ===== EXPORT NOTE =====
noteRouter.get("/note/:id/export", middleware_1.default, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { format } = req.query;
        if (!id) {
            return res.status(400).json({ message: "Note ID required" });
        }
        const note = await prisma.note.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                desc: true,
                createdAt: true,
                updatedAt: true,
                userId: true
            },
        });
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        if (note.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        let content = "";
        let contentType = "text/plain";
        let filename = `${note.title || "note"}.txt`;
        if (format === "md") {
            content = `# ${note.title}\n\n${note.desc}\n\n---\nCreated: ${note.createdAt}\nUpdated: ${note.updatedAt}`;
            filename = `${note.title || "note"}.md`;
            contentType = "text/markdown";
        }
        else {
            content = `${note.title}\n${"-".repeat(note.title.length)}\n\n${note.desc}\n\n---\nCreated: ${note.createdAt}\nUpdated: ${note.updatedAt}`;
        }
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(content);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error exporting note" });
    }
});
exports.default = noteRouter;
//# sourceMappingURL=note.js.map