import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

app.use("/api/auth", authRoutes);


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectDB();
});
