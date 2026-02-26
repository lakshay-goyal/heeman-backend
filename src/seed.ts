import { prisma } from "./lib/prisma";
import { ENV } from "./config/env.config";

async function main() {
    const adminEmail = ENV.ADMIN_EMAIL;
    const adminPassword = ENV.ADMIN_PASSWORD;

    console.log(`Checking for admin user: ${adminEmail}`);

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (existingAdmin) {
        // Check if user has an account (password)
        const account = await prisma.account.findFirst({
            where: { userId: existingAdmin.id }
        });

        if (!account) {
            console.log("Found admin user record WITHOUT a password/account. Deleting to allow fresh signup...");
            await prisma.user.delete({ where: { email: adminEmail } });
            console.log("Record cleared. Please proceed with Sign Up on the frontend.");
        } else {
            console.log("Admin account confirmed. Ensuring role is set...");
            await prisma.user.update({
                where: { email: adminEmail },
                data: { role: "admin" }
            });
            console.log("Admin role active.");
        }
    } else {
        console.log("No admin user found yet.");
        console.log(`Please go to the frontend (http://localhost:5173), navigate to 'Sign Up', and create an account using:`);
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log("After signing up, RUN THIS SEED SCRIPT again to finalize the 'admin' role.");
    }
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
