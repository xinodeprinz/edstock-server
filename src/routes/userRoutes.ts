import { Router } from "express";
import {
  createUser,
  getUsers,
  signinUser,
} from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.post("/signin", signinUser);
router.post("/", createUser);

export default router;
