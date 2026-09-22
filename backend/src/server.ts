import express from "express";
import cors from "cors";
import { prisma } from "./config/prisma";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";


const app = express();

const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});