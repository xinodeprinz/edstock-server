import { Router } from "express";
import {
  createProduct,
  getCategories,
  getProducts,
} from "../controllers/productController";

const router = Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.get("/categories", getCategories);

export default router;
