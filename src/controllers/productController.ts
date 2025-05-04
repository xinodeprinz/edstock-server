// productController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
import { notifyLowStock } from "./notification";

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/products");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// Filter for image files only
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, JPG, PNG, and WEBP allowed."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search, categoryId } = req.query;
    const products = await prisma.products.findMany({
      where: {
        name: { contains: search as string, mode: "insensitive" },
        ...(categoryId && { categoryId: categoryId as string }),
      },
      include: {
        category: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products" });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.products.findUnique({
      where: { productId: id },
      include: {
        category: true,
      },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving product" });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      price,
      rating,
      stockQuantity,
      categoryId,
      location,
      sku,
      supplier,
    } = req.body;

    // Handle photo upload
    const photoPath = req.file
      ? `/uploads/products/${req.file.filename}`
      : null;

    const product = await prisma.products.create({
      data: {
        name,
        price: parseFloat(price),
        rating: rating ? parseFloat(rating) : null,
        stockQuantity: parseInt(stockQuantity, 10),
        categoryId,
        photo: photoPath,
        location,
        sku,
        supplier,
      },
    });

    // Notify about low stocks
    await notifyLowStock();

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product" });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      rating,
      stockQuantity,
      categoryId,
      location,
      sku,
      supplier,
    } = req.body;

    // Check if product exists
    const existingProduct = await prisma.products.findUnique({
      where: { productId: id },
    });

    if (!existingProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Handle photo upload
    let photoPath = existingProduct.photo;
    if (req.file) {
      // Delete old photo if exists
      if (existingProduct.photo) {
        const oldPhotoPath = path.join(__dirname, "..", existingProduct.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      photoPath = `/uploads/products/${req.file.filename}`;
    }

    const updatedProduct = await prisma.products.update({
      where: { productId: id },
      data: {
        name: name !== undefined ? name : existingProduct.name,
        location: location !== undefined ? location : existingProduct.location,
        sku: sku !== undefined ? sku : existingProduct.sku,
        supplier: supplier !== undefined ? supplier : existingProduct.supplier,
        price: price !== undefined ? parseFloat(price) : existingProduct.price,
        rating:
          rating !== undefined ? parseFloat(rating) : existingProduct.rating,
        stockQuantity:
          stockQuantity !== undefined
            ? parseInt(stockQuantity, 10)
            : existingProduct.stockQuantity,
        categoryId:
          categoryId !== undefined ? categoryId : existingProduct.categoryId,
        photo: photoPath,
      },
    });

    // Notify about low stocks
    await notifyLowStock();

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await prisma.products.findUnique({
      where: { productId: id },
    });

    if (!existingProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Delete photo if exists
    if (existingProduct.photo) {
      const photoPath = path.join(__dirname, "..", existingProduct.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Delete product from database
    await prisma.products.delete({
      where: { productId: id },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);

    // Special handling for foreign key constraints
    if (error?.code === "P2003") {
      res.status(400).json({
        message:
          "Cannot delete product because it is referenced by sales or purchases records",
      });
      return;
    }

    res.status(500).json({ message: "Error deleting product" });
  }
};

export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await prisma.categories.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving categories" });
  }
};

export const lowStocksNotification = async (req: Request, res: Response) => {
  await notifyLowStock();
  res.json({ message: "Email sent to all super admins about low stocks." });
};
