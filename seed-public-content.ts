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

async function main() {
  const school = await prisma.school.findFirst();
  if (!school) {
    console.log("No school found. Run seed first.");
    return;
  }

  // Testimonials
  const testimonials = [
    { name: "Mrs Adewale", role: "Parent", text: "FFB transformed my child's confidence and academic performance. The teachers are truly passionate about every student's success.", rating: 5 },
    { name: "Mr Johnson", role: "Parent", text: "The teachers are passionate and supportive. My son has grown tremendously in both academics and character since joining FFB.", rating: 5 },
    { name: "Mrs Bello", role: "Parent", text: "A wonderful environment for learning and character development. I highly recommend FFB Group of Schools to any parent.", rating: 5 },
    { name: "Mr Okafor", role: "Alumni", text: "FFB prepared me well for university. The discipline and academic rigor gave me a strong foundation for success.", rating: 5 },
    { name: "Dr Akinwale", role: "Parent", text: "The school's commitment to excellence is evident in everything they do. My daughter loves going to school every day.", rating: 5 },
  ];

  for (let i = 0; i < testimonials.length; i++) {
    await prisma.testimonial.create({
      data: {
        schoolId: school.id,
        name: testimonials[i].name,
        role: testimonials[i].role,
        text: testimonials[i].text,
        rating: testimonials[i].rating,
        sortOrder: i,
      },
    });
  }
  console.log(`Created ${testimonials.length} testimonials`);

  // FAQs
  const faqs = [
    { question: "What is the admission process?", answer: "Visit our Apply page to fill out the admission form. Our admissions team will review your application and contact you for an entrance examination and interview.", category: "Admissions", sortOrder: 0 },
    { question: "Do you offer boarding facilities?", answer: "Yes, FFB Group of Schools provides comfortable boarding facilities with dedicated house parents, 24/7 security, and a conducive learning environment for boarders.", category: "Facilities", sortOrder: 1 },
    { question: "What extracurricular activities are available?", answer: "We offer sports, clubs, debates, music, dance, drama, and various skill acquisition programmes to develop the whole child.", category: "Activities", sortOrder: 2 },
    { question: "How can I track my child's progress?", answer: "Parents can track their child's academic progress through the school portal. You can view grades, attendance, and teacher comments in real-time.", category: "Parents", sortOrder: 3 },
    { question: "What curriculum does the school follow?", answer: "We follow the Nigerian National Curriculum (WAEC/NECO approved) enhanced with British Cambridge standards for a well-rounded education.", category: "Academic", sortOrder: 4 },
    { question: "Are there scholarship opportunities?", answer: "Yes, we offer merit-based scholarships for outstanding students. Contact our admissions office for more details on available scholarship programmes.", category: "Admissions", sortOrder: 5 },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: {
        schoolId: school.id,
        ...faq,
      },
    });
  }
  console.log(`Created ${faqs.length} FAQs`);

  // Milestones
  const milestones = [
    { year: "2008", event: "School founded with 45 students and 6 teachers", sortOrder: 0 },
    { year: "2013", event: "First set of WAEC candidates achieved 92% pass rate", sortOrder: 1 },
    { year: "2016", event: "Expanded to include junior and senior secondary sections", sortOrder: 2 },
    { year: "2019", event: "State-of-the-art science laboratory commissioned", sortOrder: 3 },
    { year: "2022", event: "National recognition for academic excellence", sortOrder: 4 },
    { year: "2024", event: "Digital learning platform launched for all students", sortOrder: 5 },
  ];

  for (const m of milestones) {
    await prisma.milestone.create({
      data: {
        schoolId: school.id,
        ...m,
      },
    });
  }
  console.log(`Created ${milestones.length} milestones`);

  // Update school with mission/vision/values/founder message
  await prisma.school.update({
    where: { id: school.id },
    data: {
      mission: "To provide quality education that empowers students with knowledge, skills, and values to become responsible leaders and global citizens.",
      vision: "To be a leading institution recognized for academic excellence, innovation, and holistic development of young minds.",
      coreValues: "Integrity, Discipline, Excellence, Innovation, Respect, Leadership",
      founderMessage: "Welcome to FFB Group of Schools. Our mission is to inspire young minds and equip them with the tools they need to succeed in an ever-changing world. At FFB, we focus not only on academic excellence but also on leadership development, character building, and the pursuit of knowledge.",
    },
  });
  console.log("Updated school with mission/vision/values");

  console.log("\nDone! Public content seeded successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
