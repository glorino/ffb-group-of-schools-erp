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
  if (!school) { console.error("No school found"); return; }

  console.log("Seeding transport...");
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        schoolId: school.id, name: "School Bus Alpha", plateNumber: "LAG-123-AB",
        type: "bus", capacity: 45, driverName: "Ahmed Bello", driverPhone: "08012345678", status: "active",
      },
    }),
    prisma.vehicle.create({
      data: {
        schoolId: school.id, name: "School Bus Beta", plateNumber: "LAG-456-CD",
        type: "bus", capacity: 35, driverName: "Chukwuemeka Okafor", driverPhone: "08023456789", status: "active",
      },
    }),
    prisma.vehicle.create({
      data: {
        schoolId: school.id, name: "Staff Van Charlie", plateNumber: "LAG-789-EF",
        type: "van", capacity: 14, driverName: "Fatima Yusuf", driverPhone: "08034567890", status: "active",
      },
    }),
    prisma.vehicle.create({
      data: {
        schoolId: school.id, name: "School Bus Delta", plateNumber: "LAG-012-GH",
        type: "bus", capacity: 40, driverName: "Sunday Adeyemi", driverPhone: "08045678901", status: "maintenance",
      },
    }),
    prisma.vehicle.create({
      data: {
        schoolId: school.id, name: "Mini Bus Echo", plateNumber: "LAG-345-IJ",
        type: "minibus", capacity: 20, driverName: "Ibrahim Musa", driverPhone: "08056789012", status: "active",
      },
    }),
  ]);

  const routes = await Promise.all([
    prisma.transportRoute.create({
      data: {
        vehicleId: vehicles[0].id, name: "Mainland Express Route",
        stops: JSON.stringify(["CMS Bus Stop", "Tafawa Balewa Square", "Surulere Junction", "School Gate"]),
        distance: 15.5, fare: 5000, departureTime: "06:30", arrivalTime: "07:30", status: "active",
      },
    }),
    prisma.transportRoute.create({
      data: {
        vehicleId: vehicles[1].id, name: "Island Loop Route",
        stops: JSON.stringify(["Lekki Phase 1", "Ajah Under Bridge", "VGC Estate", "School Gate"]),
        distance: 22.0, fare: 7500, departureTime: "06:00", arrivalTime: "07:15", status: "active",
      },
    }),
    prisma.transportRoute.create({
      data: {
        vehicleId: vehicles[2].id, name: "Staff Shuttle",
        stops: JSON.stringify(["Ikeja GRA", "Ogba Roundabout", "School Gate"]),
        distance: 8.0, fare: 3000, departureTime: "07:00", arrivalTime: "07:45", status: "active",
      },
    }),
  ]);

  console.log(`Created ${vehicles.length} vehicles, ${routes.length} routes`);

  console.log("Seeding clinic visits...");
  const students = await prisma.student.findMany({ take: 12 });
  const visits = [
    { reason: "Headache and fever", diagnosis: "Malaria", treatment: "ACT medication prescribed", medication: "Artemether-Lumefantrine" },
    { reason: "Stomach ache", diagnosis: "Gastritis", treatment: "Antacid and dietary advice", medication: "Omeprazole" },
    { reason: "Cough and catarrh", diagnosis: "Upper respiratory infection", treatment: "Antibiotics and cough syrup", medication: "Amoxicillin" },
    { reason: "Injured knee during sports", diagnosis: "Minor sprain", treatment: "RICE protocol, pain relief", medication: "Ibuprofen" },
    { reason: "Allergic reaction", diagnosis: "Skin allergy", treatment: "Antihistamine prescribed", medication: "Cetirizine" },
    { reason: "Toothache", diagnosis: "Dental caries", treatment: "Referred to dentist", medication: "Paracetamol" },
    { reason: "Eye irritation", diagnosis: "Conjunctivitis", treatment: "Eye drops prescribed", medication: "Chloramphenicol eye drops" },
    { reason: "Back pain", diagnosis: "Muscle strain", treatment: "Rest and analgesics", medication: "Diclofenac" },
    { reason: "Persistent fever", diagnosis: "Typhoid", treatment: "Antibiotics and fluid therapy", medication: "Ciprofloxacin" },
    { reason: "Skin rash", diagnosis: "Fungal infection", treatment: "Antifungal cream", medication: "Clotrimazole cream" },
  ];

  let visitCount = 0;
  for (let i = 0; i < Math.min(students.length, visits.length); i++) {
    const visit = visits[i];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 14));

    await prisma.clinicVisit.create({
      data: {
        studentId: students[i].id,
        date,
        reason: visit.reason,
        diagnosis: visit.diagnosis,
        treatment: visit.treatment,
        medication: visit.medication,
      },
    });
    visitCount++;
  }

  console.log(`Created ${visitCount} clinic visits`);
  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
