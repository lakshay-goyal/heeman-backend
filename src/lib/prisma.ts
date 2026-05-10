import { ENV } from "../config/env.config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

let databaseUrlOverride: string | undefined;
let activeConnectionString: string | undefined;
let prismaClient: PrismaClient | undefined;

export function setDatabaseUrl(connectionString: string | undefined) {
    if (!connectionString || connectionString === databaseUrlOverride) return;

    databaseUrlOverride = connectionString;

    if (prismaClient && activeConnectionString !== connectionString) {
        prismaClient.$disconnect().catch((error) => {
            console.error("Failed to disconnect stale Prisma client", error);
        });
        prismaClient = undefined;
        activeConnectionString = undefined;
    }
}

function getConnectionString() {
    return databaseUrlOverride || ENV.DATABASE_URL;
}

function getPrisma() {
    const connectionString = getConnectionString();

    if (!prismaClient || activeConnectionString !== connectionString) {
        const adapter = new PrismaPg({ connectionString });
        prismaClient = new PrismaClient({ adapter });
        activeConnectionString = connectionString;
    }

    return prismaClient;
}

const prisma = new Proxy({} as PrismaClient, {
    get(_target, property, receiver) {
        const client = getPrisma() as any;
        const value = Reflect.get(client, property, receiver);
        return typeof value === "function" ? value.bind(client) : value;
    },
});

export { prisma };
