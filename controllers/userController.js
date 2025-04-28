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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.hashPassword = exports.signinUser = exports.getUsers = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.users.findMany();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving users" });
    }
});
exports.getUsers = getUsers;
const signinUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = yield prisma.users.findFirst({
            where: { email },
        });
        if (!user) {
            res.status(400).json({ message: "Invalid login credentials" });
            return;
        }
        // Compare passwords
        const isMatch = bcryptjs_1.default.compareSync(password, user.password || "");
        if (!isMatch) {
            res.status(400).json({ message: "Invalid login credentials" });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.userId, email: user.email }, process.env.JWT_SECRET || "your_jwt_secret_key", { expiresIn: "7d" } // Token validity
        );
        // Remove password from the response
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.status(200).json({ token, user: userWithoutPassword });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.signinUser = signinUser;
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    return hashedPassword;
});
exports.hashPassword = hashPassword;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, name, email, photo, role } = req.body;
        const user = yield prisma.users.create({
            data: Object.assign(Object.assign({ userId,
                name,
                email,
                role }, (photo && { photo })), { password: yield (0, exports.hashPassword)("12345") }),
        });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating user" });
    }
});
exports.createUser = createUser;
