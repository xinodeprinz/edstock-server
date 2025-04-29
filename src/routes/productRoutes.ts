// productRoutes.ts
import { Router } from "express";
import {
  createProduct,
  getCategories,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
  upload,
} from "../controllers/productController";

const router = Router();

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);
router.post("/", upload.single("photo"), createProduct);
router.put("/:id", upload.single("photo"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
