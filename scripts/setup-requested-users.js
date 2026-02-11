const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
    const passwordRaw = "1234";
    const passwordHash = await bcrypt.hash(passwordRaw, 10);

    const usersToSetup = [
        { email: "admin@psu.ac.th", role: "admin", name: "Admin", username: "admin_user" },
        { email: "it@psu.ac.th", role: "it_support", name: "IT Support", username: "it_support_alias" },
        { email: "bb@psu.ac.th", role: "user", name: "BB User", username: "bb_user" }
    ];

    for (const u of usersToSetup) {
        // Check if user exists
        const existing = await prisma.user.findFirst({
            where: { email: u.email }
        });

        if (existing) {
            // Update password
            await prisma.user.update({
                where: { id: existing.id },
                data: {
                    password: passwordHash,
                    role: u.role // Ensure role is correct
                }
            });
            console.log(`✅ Updated password for ${u.email}`);
        } else {
            // Create user
            await prisma.user.create({
                data: {
                    email: u.email,
                    password: passwordHash,
                    name: u.name,
                    role: u.role,
                    username: u.username,
                    department: "General"
                }
            });
            console.log(`✅ Created user ${u.email}`);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
