const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const counts = {
        User: await prisma.user.count(),
        Ticket: await prisma.ticket.count(),
        Equipment: await prisma.equipment.count(),
        Room: await prisma.room.count(),
        Category: await prisma.category.count(),
        ActivityLog: await prisma.activityLog.count(),
        PersonalTask: await prisma.personalTask.count()
    };

    console.log("=== Database Audit ===");
    console.table(counts);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
