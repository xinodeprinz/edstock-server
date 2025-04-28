import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products" });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, name, price, rating, stockQuantity, categoryId } =
      req.body;
    const product = await prisma.products.create({
      data: {
        productId,
        name,
        price,
        rating,
        stockQuantity,
        categoryId,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error creating item" });
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
