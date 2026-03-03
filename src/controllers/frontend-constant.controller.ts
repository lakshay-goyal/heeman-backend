import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

import { defaultConstants } from "../constants";

export const getConstants = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { key } = req.query;

        if (key) {
            const constant = await prisma.frontendConstant.findUnique({
                where: { key: String(key) },
            });
            return res.status(200).json({
                success: true,
                data: constant || { key: String(key), value: defaultConstants[String(key)] || {} }
            });
        }

        const constants = await prisma.frontendConstant.findMany();

        // Merge with defaults
        const result = Object.keys(defaultConstants).map((k) => {
            const found = constants.find((c) => c.key === k);
            return found || { key: k, value: defaultConstants[k] };
        });

        // Include any db keys that are not in defaults
        constants.forEach((c) => {
            if (!defaultConstants[c.key]) {
                result.push(c);
            }
        });

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const updateConstant = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { key, value } = req.body;

        if (!key || !value) {
            return res.status(400).json({ success: false, message: "key and value are required" });
        }

        const constant = await prisma.frontendConstant.upsert({
            where: { key: String(key) },
            update: { value },
            create: { key: String(key), value },
        });

        return res.status(200).json({ success: true, data: constant, message: "Constant updated successfully" });
    } catch (error) {
        next(error);
    }
};
