const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
    const email = "bb@psu.ac.th";
    const passwordRaw = "user123";
    const passwordHash = await bcrypt.hash(passwordRaw, 10);

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`User ${email} already exists.`);
        return;
    }

    // Create user
    await prisma.user.create({
        data: {
            email,
            password: passwordHash,
            name: "BB User",
            role: "user",
            username: "bb_user",
            department: "General"
        }
    });

    console.log(`✅ User ${email} created successfully with password: ${passwordRaw}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
