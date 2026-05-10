import { ENV } from "../config/env.config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { AsyncLocalStorage } from "node:async_hooks";

const prismaStorage = new AsyncLocalStorage<PrismaClient>();
let localPrismaClient: PrismaClient | undefined;

function createPrisma(connectionString: string) {
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ adapter });
}

export async function withPrismaConnection<T>(connectionString: string | undefined, callback: () => Promise<T> | T) {
    const client = createPrisma(connectionString || ENV.DATABASE_URL);

    try {
        return await prismaStorage.run(client, callback);
    } finally {
        await client.$disconnect().catch((error) => {
            console.error("Failed to disconnect Prisma client", error);
        });
    }
}

function getPrisma() {
    const requestClient = prismaStorage.getStore();
    if (requestClient) return requestClient;

    if (!localPrismaClient) {
        localPrismaClient = createPrisma(ENV.DATABASE_URL);
    }

    return localPrismaClient;
}

const prisma = new Proxy({} as PrismaClient, {
    get(_target, property, receiver) {
        const client = getPrisma() as any;
        const value = Reflect.get(client, property, receiver);
        return typeof value === "function" ? value.bind(client) : value;
    },
});

export { prisma };
