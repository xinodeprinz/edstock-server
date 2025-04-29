// index.ts
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

/* ROUTE IMPORTS */
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* STATIC FILE SERVING */
// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ROUTES */
app.use("/products", productRoutes); // http://localhost:8000/products
app.use("/users", userRoutes); // http://localhost:8000/users

app.use("/test", (req, res) => {
  res.send("Hello World!");
});

/* SERVER */
const port = Number(process.env.PORT) || 3001;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
