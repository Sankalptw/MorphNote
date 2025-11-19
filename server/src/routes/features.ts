import { Router, Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const featuresRouter = Router()
const prisma = new PrismaClient()

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

const authenticateToken = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ message: "No token" })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.userId = decoded.userId || decoded.id  
    next()
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }
}

featuresRouter.get("/notes/search", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { q } = req.query
    const userId = req.userId

    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const notes = await prisma.note.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: q as string, mode: "insensitive" } },
          { desc: { contains: q as string, mode: "insensitive" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
    })

    return res.json({ notes })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error searching notes" })
  }
})

featuresRouter.post("/folders/create", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name } = req.body
    const userId = req.userId

    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const folder = await prisma.folder.create({
      data: { name, userId },
    })

    return res.json({ folder })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error creating folder" })
  }
})

featuresRouter.get("/folders/all", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.userId

    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const folders = await prisma.folder.findMany({
      where: { userId },
      include: { notes: true },
    })

    return res.json({ folders })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error fetching folders" })
  }
})

featuresRouter.delete("/folders/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.userId

    if (!userId || !id) return res.status(401).json({ message: "Unauthorized" })

    await prisma.folder.delete({
      where: { id },
    })

    return res.json({ message: "Folder deleted" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error deleting folder" })
  }
})

featuresRouter.post("/tags/create", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name } = req.body
    const userId = req.userId

    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const tag = await prisma.tag.create({
      data: { name, userId },
    })

    return res.json({ tag })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error creating tag" })
  }
})

featuresRouter.get("/tags/all", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.userId

    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const tags = await prisma.tag.findMany({
      where: { userId },
      include: { notes: true },
    })

    return res.json({ tags })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error fetching tags" })
  }
})

featuresRouter.post("/notes/:noteId/tags", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params
    const { tagIds } = req.body
    const userId = req.userId

    if (!userId || !noteId) return res.status(401).json({ message: "Unauthorized" })

    const note = await prisma.note.update({
      where: { id: noteId },
      data: {
        tags: {
          set: tagIds.map((id: string) => ({ id })),
        },
      },
      include: { tags: true },
    })

    return res.json({ note })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error updating tags" })
  }
})

featuresRouter.post("/notes/:noteId/share", authenticateToken, async (req: Request, res: Response) => {
  try {
    const noteId = req.params.noteId
    const { sharedWith, permission } = req.body
    const userId = req.userId

    if (!userId || !noteId || !sharedWith) return res.status(401).json({ message: "Unauthorized" })

    const share = await prisma.noteShare.create({
      data: {
        noteId: noteId as string,
        sharedWith,
        permission: permission || "view",
      },
    })

    return res.json({ share })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error sharing note" })
  }
})

featuresRouter.get("/notes/:noteId/shares", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params

    if (!noteId) return res.status(401).json({ message: "Invalid note ID" })

    const shares = await prisma.noteShare.findMany({
      where: { noteId },
    })

    return res.json({ shares })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error fetching shares" })
  }
})

featuresRouter.delete("/shares/:shareId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params

    if (!shareId) return res.status(401).json({ message: "Invalid share ID" })

    await prisma.noteShare.delete({
      where: { id: shareId },
    })

    return res.json({ message: "Share removed" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error removing share" })
  }
})

featuresRouter.put("/notes/:noteId/folder", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params
    const { folderId } = req.body

    if (!noteId) return res.status(401).json({ message: "Invalid note ID" })

    const note = await prisma.note.update({
      where: { id: noteId },
      data: { folderId: folderId || null },
    })

    return res.json({ note })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error updating note folder" })
  }
})

export default featuresRouter