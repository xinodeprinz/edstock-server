"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = exports.upload = void 0;
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, "../uploads/products");
        // Create directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});
// Filter for image files only
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Only JPEG, JPG, PNG, and WEBP allowed."));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, categoryId } = req.query;
        const products = yield prisma.products.findMany({
            where: Object.assign({ name: { contains: search, mode: "insensitive" } }, (categoryId && { categoryId: categoryId })),
            include: {
                category: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving products" });
    }
});
exports.getProducts = getProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield prisma.products.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving product" });
    }
});
exports.getProductById = getProductById;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, price, rating, stockQuantity, categoryId, location, sku, supplier, } = req.body;
        // Handle photo upload
        const photoPath = req.file
            ? `/uploads/products/${req.file.filename}`
            : null;
        const product = yield prisma.products.create({
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
        res.status(201).json(product);
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Error creating product" });
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, price, rating, stockQuantity, categoryId, location, sku, supplier, } = req.body;
        // Check if product exists
        const existingProduct = yield prisma.products.findUnique({
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
                const oldPhotoPath = path_1.default.join(__dirname, "..", existingProduct.photo);
                if (fs_1.default.existsSync(oldPhotoPath)) {
                    fs_1.default.unlinkSync(oldPhotoPath);
                }
            }
            photoPath = `/uploads/products/${req.file.filename}`;
        }
        const updatedProduct = yield prisma.products.update({
            where: { productId: id },
            data: {
                name: name !== undefined ? name : existingProduct.name,
                location: location !== undefined ? location : existingProduct.location,
                sku: sku !== undefined ? sku : existingProduct.sku,
                supplier: supplier !== undefined ? supplier : existingProduct.supplier,
                price: price !== undefined ? parseFloat(price) : existingProduct.price,
                rating: rating !== undefined ? parseFloat(rating) : existingProduct.rating,
                stockQuantity: stockQuantity !== undefined
                    ? parseInt(stockQuantity, 10)
                    : existingProduct.stockQuantity,
                categoryId: categoryId !== undefined ? categoryId : existingProduct.categoryId,
                photo: photoPath,
            },
        });
        res.json(updatedProduct);
    }
    catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Error updating product" });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if product exists
        const existingProduct = yield prisma.products.findUnique({
            where: { productId: id },
        });
        if (!existingProduct) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Delete photo if exists
        if (existingProduct.photo) {
            const photoPath = path_1.default.join(__dirname, "..", existingProduct.photo);
            if (fs_1.default.existsSync(photoPath)) {
                fs_1.default.unlinkSync(photoPath);
            }
        }
        // Delete product from database
        yield prisma.products.delete({
            where: { productId: id },
        });
        res.json({ message: "Product deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        // Special handling for foreign key constraints
        if ((error === null || error === void 0 ? void 0 : error.code) === "P2003") {
            res.status(400).json({
                message: "Cannot delete product because it is referenced by sales or purchases records",
            });
            return;
        }
        res.status(500).json({ message: "Error deleting product" });
    }
});
exports.deleteProduct = deleteProduct;
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prisma.categories.findMany();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving categories" });
    }
});
exports.getCategories = getCategories;
