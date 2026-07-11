import { prisma } from "../src/lib/prisma";
import bcryptjs from "bcryptjs";

const main = async () => {
  console.log("Seeding database...");

  // ── Admin user ───────────────────────────────────────────
  const hashedPassword = await bcryptjs.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@rentnest.com" },
    update: {},
    create: {
      name: "RentNest Admin",
      email: "admin@rentnest.com",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("✅ Admin created: admin@rentnest.com / admin123");

  // ── Categories ───────────────────────────────────────────
  const categories = [
    "Apartment",
    "House",
    "Studio",
    "Villa",
    "Room",
    "Office",
    "Duplex",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("✅ Categories seeded:", categories.join(", "));
  console.log("\n🎉 Seed complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin email   : admin@rentnest.com");
  console.log("Admin password: admin123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());