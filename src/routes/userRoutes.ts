import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUsers,
  signinUser,
} from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.post("/signin", signinUser);
router.post("/", createUser);
router.delete("/:id", deleteUser);

export default router;
