const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
    const email = "bae1@psu.ac.th";
    const password = "password"; // Default password as per request context or standard
    // Actually user likely used '123456' or similar. I'll stick to a simple one and tell them.
    // In previous turn I saw '123456' used in controller.

    const hash = await bcrypt.hash("123456", 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'admin',
            enabled: true,
            password: hash
        },
        create: {
            email,
            password: hash,
            name: "Bae Admin",
            role: "admin",
            enabled: true,
            department: "Admin Dept"
        }
    });

    console.log(`Restored admin user: ${user.email}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
