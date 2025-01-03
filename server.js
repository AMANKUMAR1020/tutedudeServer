import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/dbConnection.js";
import { userRouter } from "./routes/userRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
// import { corsOptions } from "./config/corsOptions.js";

dotenv.config();

const app = express();
app.use(express.json());
// app.use(cors(corsOptions));
app.use(cors());
connectDB();

app.use("/api/auth/", authRouter);
app.use("/api/users/", userRouter);

const port = process.env.PORT || 3500;

app.listen(port, async () => {
	console.log(`server is running on port ${port}`);
});