import { prisma } from "./lib/prisma";

async function main() {
    // Create a new user without a post
    const email = `alice_${Date.now()}@prisma.io`;
    const user = await prisma.user.create({
        data: {
            name: "Alice",
            email: email,
        },
    });
    console.log("Created user:", user);

    // Fetch all users
    const allUsers = await prisma.user.findMany();
    console.log("\nAll users:", JSON.stringify(allUsers, null, 2));
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
