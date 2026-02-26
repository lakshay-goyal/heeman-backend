import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: id as string },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
