import { Router, Request, Response, NextFunction } from "express"
import { PrismaClient } from "../generated/prisma/client"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userRouter = Router()
const prisma = new PrismaClient()

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

// Middleware to extract userId from token
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ message: "No token" })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.userId = decoded.id
    next()
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }
}

userRouter.post("/update-profile", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, bio } = req.body
    const userId = req.userId

    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const user = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName },
    })

    return res.json({ message: "Profile updated", user })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error updating profile" })
  }
})

userRouter.post("/change-password", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body
    const userId = req.userId

    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ message: "User not found" })

    const matchPass = await bcrypt.compare(oldPassword, user.password)
    if (!matchPass) return res.status(401).json({ message: "Wrong password" })

    const hashedPass = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPass },
    })

    return res.json({ message: "Password changed successfully" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Error changing password" })
  }
})

export default userRouter