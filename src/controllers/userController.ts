import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
};

export const signinUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await prisma.users.findFirst({
      where: { email },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid login credentials" });
      return;
    }

    // Compare passwords
    const isMatch = bcrypt.compareSync(password, user.password || "");

    if (!isMatch) {
      res.status(400).json({ message: "Invalid login credentials" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" } // Token validity
    );

    // Remove password from the response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, name, email, photo, role } = req.body;
    const user = await prisma.users.create({
      data: {
        userId,
        name,
        email,
        role,
        ...(photo && { photo }),
        password: await hashPassword("12345"),
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingUser = await prisma.users.findUnique({
      where: { userId: id },
    });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Delete photo if exists
    if (existingUser.photo) {
      const photoPath = path.join(__dirname, "..", existingUser.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Delete product from database
    await prisma.users.delete({
      where: { userId: id },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting user:", error);

    // Special handling for foreign key constraints
    if (error?.code === "P2003") {
      res.status(400).json({
        message: "Cannot delete user",
      });
      return;
    }

    res.status(500).json({ message: "Error deleting user" });
  }
};
