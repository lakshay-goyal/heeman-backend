import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";

export const toggleWishlist = async (req: Request, res: Response) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session || !session.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { wishlist: true },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isInWishlist = user.wishlist.some((p) => p.id === productId);

        if (isInWishlist) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    wishlist: {
                        disconnect: { id: productId },
                    },
                },
            });
            return res.json({ message: "Removed from wishlist", added: false });
        } else {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    wishlist: {
                        connect: { id: productId },
                    },
                },
            });
            return res.json({ message: "Added to wishlist", added: true });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getWishlist = async (req: Request, res: Response) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session || !session.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                wishlist: {
                    include: {
                        images: true,
                        category: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json(user.wishlist);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
