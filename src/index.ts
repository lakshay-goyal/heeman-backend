import express from "express";
import cors from "cors";
import { ENV } from "./config/env.config";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";
import couponRoutes from "./routes/coupon.routes";
import contactRoutes from "./routes/contact.routes";
import categoryRoutes from "./routes/category.routes";
import uploadRoutes from "./routes/upload.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/logger";

import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth";

const app = express();
const port = ENV.PORT;

// CORS - allow both frontend and admin origins
const allowedOrigins = [
    ENV.FRONTEND_URL,
    ENV.ADMIN_URL,
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

// Better Auth Handler must be BEFORE express.json()
app.use("/api/auth", toNodeHandler(auth));

// Middleware
app.use(express.json());
app.use(requestLogger);

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Heeman Backend APIs are working!", version: "1.0.0" });
});

app.get("/api/me", async (req, res) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });
    return res.json(session);
});

import wishlistRoutes from "./routes/wishlist.routes";
import enquiryRoutes from "./routes/enquiry.routes";
import verifyRoutes from "./routes/verify.routes";

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/verify", verifyRoutes);

// Error Handling
app.use(errorHandler);

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});
