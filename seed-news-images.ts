import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const newsItems = [
  {
    title: "Leadership Bootcamp",
    content: "Over 150 students participated in the annual Leadership Bootcamp organized by FFB Group of Schools. The programme covered topics including public speaking, project management, entrepreneurship, and digital literacy.",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=500&fit=crop",
  },
  {
    title: "New Science Laboratory",
    content: "A new state-of-the-art science laboratory has been commissioned at FFB Group of Schools. The laboratory features modern equipment for Physics, Chemistry, and Biology practical sessions.",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=500&fit=crop",
  },
  {
    title: "Academic Excellence Award",
    content: "Our students received national recognition for outstanding WAEC results. With a 98% pass rate and multiple distinctions across key subjects, our school has been ranked among the top performing institutions in the state.",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=800&h=500&fit=crop",
  },
];

async function main() {
  const school = await prisma.school.findFirst();
  if (!school) { console.error("No school found"); return; }

  for (const news of newsItems) {
    const existing = await prisma.announcement.findFirst({
      where: { schoolId: school.id, type: "news", title: news.title },
    });
    if (existing) {
      const existingTarget = existing.target ? (typeof existing.target === "string" ? JSON.parse(existing.target) : existing.target) : {};
      await prisma.announcement.update({
        where: { id: existing.id },
        data: { target: { ...existingTarget, imageUrl: news.imageUrl } },
      });
      console.log(`Updated: ${news.title}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
