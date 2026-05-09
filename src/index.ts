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
import { isAllowedOrigin } from "./config/origins";

import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth";

const app = express();
const port = ENV.PORT;

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
}));

// Better Auth Handler must be BEFORE express.json()
app.use("/api/auth", toNodeHandler(auth));

// Middleware
app.use("/uploads", express.static("uploads"));
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
import billingRoutes from "./routes/billing.routes";
import productEnquiryRoutes from "./routes/productEnquiry.routes";
import whatsappRoutes from "./routes/whatsapp.routes";

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/leads", productEnquiryRoutes);
app.use("/api/enquiries", productEnquiryRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/billing", billingRoutes);

// Error Handling
app.use(errorHandler);

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});
