import express from "express";
import cors from "cors";
import "dotenv/config";
import productRoutes from "./routes/product.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/logger";

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Heeman Backend APIs are working!", version: "1.0.0" });
});

app.use("/api/products", productRoutes);

// Error Handling
app.use(errorHandler);

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});
