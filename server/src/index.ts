import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




export default app;