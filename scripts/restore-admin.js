const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
    const email = "admin@psu.ac.th";
    const password = "admin"; // Default password often used or 123456. I will set to 'admin' as per typical seeds or '123456'. Let's use '123456' for consistency.
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
            name: "System Administrator",
            role: "admin",
            enabled: true,
            department: "IT Department",
            username: "admin01"
        }
    });

    console.log(`✅ Admin password reset successfully.`);
    console.log(`Email: ${email}`);
    console.log(`Password: 123456`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
