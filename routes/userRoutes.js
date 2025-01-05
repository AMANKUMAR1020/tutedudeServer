import express from "express";
import {
	getMutualUsers,
	acceptUser,
	requestUser,
	rejectUser,
	getAllUser,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/validateToken.js";

const router = express.Router();

router.get("/allusers", getAllUser);
router.get("/mutualusers", getMutualUsers);
router.post("/requestuser", verifyToken, requestUser);
router.put("/acceptuser", verifyToken, acceptUser);
router.put("/rejectuser", verifyToken, rejectUser);

export { router as userRouter };