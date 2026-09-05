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

const events = [
  { title: "School Resumption", content: "Students and staff resume for the 2026/2027 academic session. New students orientation begins.", eventDate: "2026-09-07", category: "Academic" },
  { title: "Inter-House Sports Festival", content: "Annual sports competition featuring athletics, football, and relay races across all four houses.", eventDate: "2026-09-26", category: "Sports" },
  { title: "Science & Innovation Fair", content: "Students showcase science projects, robotics, and innovation prototypes. Open to parents and the public.", eventDate: "2026-10-17", category: "Academic" },
  { title: "Cultural Day Celebration", content: "A celebration of Nigeria's rich cultural heritage with traditional dances, food, attire, and music.", eventDate: "2026-11-07", category: "Cultural" },
  { title: "Christmas Carol & Concert", content: "The school choir and drama club present an evening of Christmas carols, plays, and musical performances.", eventDate: "2026-12-05", category: "Ceremony" },
  { title: "End of First Term Exams Begin", content: "First term examinations commence for all classes. Exam timetable available on the student portal.", eventDate: "2026-12-12", category: "Academic" },
  { title: "Christmas Break", content: "School closes for the Christmas holiday. Classes resume January 4, 2027.", eventDate: "2026-12-19", category: "Holiday" },
  { title: "Second Term Resumption", content: "Students and staff return for the second term. Parent-teacher meeting scheduled for the first week.", eventDate: "2027-01-04", category: "Academic" },
  { title: "Career Day & Skills Workshop", content: "Guest speakers from various professions share career paths. Students participate in hands-on skills workshops.", eventDate: "2027-01-30", category: "Career" },
  { title: "Spelling Bee Competition", content: "Inter-class spelling bee competition for junior and senior categories. Prizes for top three winners.", eventDate: "2027-02-13", category: "Academic" },
  { title: "Art & Creative Exhibition", content: "Students display paintings, sculptures, photography, and creative writing. Art auction for charity.", eventDate: "2027-02-27", category: "Creative" },
  { title: "Second Term Exams Begin", content: "Second term examinations commence. Revision week begins February 22.", eventDate: "2027-03-08", category: "Academic" },
];

async function main() {
  const school = await prisma.school.findFirst();
  if (!school) { console.error("No school found"); return; }

  // Delete existing events
  const deleted = await prisma.announcement.deleteMany({ where: { schoolId: school.id, type: "event" } });
  console.log(`Deleted ${deleted.count} old events`);

  let created = 0;
  for (const event of events) {
    await prisma.announcement.create({
      data: {
        schoolId: school.id,
        title: event.title,
        content: event.content,
        type: "event",
        priority: "normal",
        published: true,
        target: { eventDate: event.eventDate, category: event.category, audience: ["all"] },
      },
    });
    created++;
  }

  console.log(`Created ${created} events`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
