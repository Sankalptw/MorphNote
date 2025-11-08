import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import noteRouter from "./routes/note";
import userRouter from './routes/user'

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/notes", noteRouter)
app.use('/api/user', userRouter)



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;