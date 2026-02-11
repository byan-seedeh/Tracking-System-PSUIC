const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const email = "bb@psu.ac.th";
    const user = await prisma.user.findUnique({
        where: { email }
    });
    console.log(`User ${email} exists: ${!!user}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
