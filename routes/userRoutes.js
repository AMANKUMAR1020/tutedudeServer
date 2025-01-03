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

router.get("/mutualUsers", getMutualUsers);

router.post("/requestUser", verifyToken, requestUser);

router.put("/acceptUser", verifyToken, acceptUser);
router.put("/rejectUser", verifyToken, rejectUser);

export { router as userRouter };