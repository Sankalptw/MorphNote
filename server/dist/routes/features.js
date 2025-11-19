"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const featuresRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "No token" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId || decoded.id;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
featuresRouter.get("/notes/search", authenticateToken, async (req, res) => {
    try {
        const { q } = req.query;
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const notes = await prisma.note.findMany({
            where: {
                userId,
                OR: [
                    { title: { contains: q, mode: "insensitive" } },
                    { desc: { contains: q, mode: "insensitive" } },
                ],
            },
            orderBy: { updatedAt: "desc" },
        });
        return res.json({ notes });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error searching notes" });
    }
});
featuresRouter.post("/folders/create", authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const folder = await prisma.folder.create({
            data: { name, userId },
        });
        return res.json({ folder });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error creating folder" });
    }
});
featuresRouter.get("/folders/all", authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const folders = await prisma.folder.findMany({
            where: { userId },
            include: { notes: true },
        });
        return res.json({ folders });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching folders" });
    }
});
featuresRouter.delete("/folders/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        if (!userId || !id)
            return res.status(401).json({ message: "Unauthorized" });
        await prisma.folder.delete({
            where: { id },
        });
        return res.json({ message: "Folder deleted" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error deleting folder" });
    }
});
featuresRouter.post("/tags/create", authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const tag = await prisma.tag.create({
            data: { name, userId },
        });
        return res.json({ tag });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error creating tag" });
    }
});
featuresRouter.get("/tags/all", authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const tags = await prisma.tag.findMany({
            where: { userId },
            include: { notes: true },
        });
        return res.json({ tags });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching tags" });
    }
});
featuresRouter.post("/notes/:noteId/tags", authenticateToken, async (req, res) => {
    try {
        const { noteId } = req.params;
        const { tagIds } = req.body;
        const userId = req.userId;
        if (!userId || !noteId)
            return res.status(401).json({ message: "Unauthorized" });
        const note = await prisma.note.update({
            where: { id: noteId },
            data: {
                tags: {
                    set: tagIds.map((id) => ({ id })),
                },
            },
            include: { tags: true },
        });
        return res.json({ note });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error updating tags" });
    }
});
featuresRouter.post("/notes/:noteId/share", authenticateToken, async (req, res) => {
    try {
        const noteId = req.params.noteId;
        const { sharedWith, permission } = req.body;
        const userId = req.userId;
        if (!userId || !noteId || !sharedWith)
            return res.status(401).json({ message: "Unauthorized" });
        const share = await prisma.noteShare.create({
            data: {
                noteId: noteId,
                sharedWith,
                permission: permission || "view",
            },
        });
        return res.json({ share });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error sharing note" });
    }
});
featuresRouter.get("/notes/:noteId/shares", authenticateToken, async (req, res) => {
    try {
        const { noteId } = req.params;
        if (!noteId)
            return res.status(401).json({ message: "Invalid note ID" });
        const shares = await prisma.noteShare.findMany({
            where: { noteId },
        });
        return res.json({ shares });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching shares" });
    }
});
featuresRouter.delete("/shares/:shareId", authenticateToken, async (req, res) => {
    try {
        const { shareId } = req.params;
        if (!shareId)
            return res.status(401).json({ message: "Invalid share ID" });
        await prisma.noteShare.delete({
            where: { id: shareId },
        });
        return res.json({ message: "Share removed" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error removing share" });
    }
});
featuresRouter.put("/notes/:noteId/folder", authenticateToken, async (req, res) => {
    try {
        const { noteId } = req.params;
        const { folderId } = req.body;
        if (!noteId)
            return res.status(401).json({ message: "Invalid note ID" });
        const note = await prisma.note.update({
            where: { id: noteId },
            data: { folderId: folderId || null },
        });
        return res.json({ note });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error updating note folder" });
    }
});
exports.default = featuresRouter;
//# sourceMappingURL=features.js.map