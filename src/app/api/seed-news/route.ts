import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const newsAndEvents = [
  { title: "Academic Excellence Award", content: "Our students received national recognition for outstanding WAEC results. With a 98% pass rate and multiple distinctions across key subjects, our school has been ranked among the top performing institutions in the state.", imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop", type: "news", featured: true, eventDate: null },
  { title: "New Science Laboratory", content: "A new state-of-the-art science laboratory has been commissioned at FFB Group of Schools. The laboratory features modern equipment for Physics, Chemistry, and Biology practical sessions.", imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop", type: "news", featured: true, eventDate: null },
  { title: "Leadership Bootcamp", content: "Over 150 students participated in the annual Leadership Bootcamp organized by FFB Group of Schools. The programme covered topics including public speaking, project management, entrepreneurship, and digital literacy.", imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop", type: "news", featured: true, eventDate: null },
  { title: "Interhouse Sports", content: "Annual sports competition showcasing teamwork and athleticism across all houses.", imageUrl: "", type: "event", featured: false, eventDate: "2026-03-25" },
  { title: "Science Exhibition", content: "Students present innovative science projects and research findings.", imageUrl: "", type: "event", featured: false, eventDate: "2026-04-10" },
  { title: "Graduation Ceremony", content: "Celebrating graduating students and their achievements.", imageUrl: "", type: "event", featured: false, eventDate: "2026-07-18" },
];

export async function POST() {
  try {
    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: "No school found. Run seed-auto first." }, { status: 400 });
    }

    let created = 0;
    let updated = 0;

    for (const item of newsAndEvents) {
      const existing = await prisma.announcement.findFirst({
        where: { title: item.title, schoolId: school.id },
      });

      const targetData: any = {};
      if (item.imageUrl) targetData.imageUrl = item.imageUrl;
      if (item.featured) targetData.featured = true;
      if (item.eventDate) targetData.eventDate = item.eventDate;

      if (existing) {
        await prisma.announcement.update({
          where: { id: existing.id },
          data: {
            content: item.content,
            type: item.type,
            published: true,
            target: targetData,
          },
        });
        updated++;
      } else {
        await prisma.announcement.create({
          data: {
            title: item.title,
            content: item.content,
            type: item.type,
            priority: "normal",
            published: true,
            target: targetData,
            schoolId: school.id,
          },
        });
        created++;
      }
    }

    return NextResponse.json({ success: true, created, updated, total: created + updated });
  } catch (error) {
    console.error("POST /api/seed-news error:", error);
    return NextResponse.json({ error: "Failed to seed news" }, { status: 500 });
  }
}
