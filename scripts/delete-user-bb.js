const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const email = "bb@psu.ac.th";

    // Delete user
    const deleted = await prisma.user.deleteMany({
        where: {
            email: email,
        },
    });

    console.log(`✅ Deleted ${deleted.count} user(s) with email ${email}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
