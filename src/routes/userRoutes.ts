import { Router } from "express";
import { getUsers, signinUser } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.post("/signin", signinUser);

export default router;
