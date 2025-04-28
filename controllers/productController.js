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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.createProduct = exports.getProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, categoryId } = req.query;
        const products = yield prisma.products.findMany({
            where: Object.assign({ name: { contains: search, mode: "insensitive" } }, (categoryId && { categoryId: categoryId })),
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving products" });
    }
});
exports.getProducts = getProducts;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, name, price, rating, stockQuantity, categoryId } = req.body;
        const product = yield prisma.products.create({
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
    }
    catch (error) {
        res.status(500).json({ message: "Error creating item" });
    }
});
exports.createProduct = createProduct;
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
