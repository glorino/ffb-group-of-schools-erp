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

const lessonPlans = [
  { subject: "Mathematics", className: "JSS1A", topic: "Introduction to Algebra", objectives: "Students will understand variables and simple equations", content: "Cover basic algebraic concepts: variables, constants, coefficients, and solving linear equations. Include practice problems from the textbook.", resources: "New General Mathematics JSS1, Chalkboard" },
  { subject: "Mathematics", className: "JSS2B", topic: "Quadratic Equations", objectives: "Students will solve quadratic equations by factorization", content: "Review of linear equations, introduction to quadratic equations, factorization method, verification of solutions. Include past WAEC questions.", resources: "New General Mathematics JSS2, Graphing calculator" },
  { subject: "English Language", className: "JSS1A", topic: "Parts of Speech - Nouns", objectives: "Students will identify and classify different types of nouns", content: "Define nouns, common vs proper nouns, concrete vs abstract nouns, singular and plural forms. Include worksheets for practice.", resources: "English Composition for JSS1, Worksheet handouts" },
  { subject: "English Language", className: "JSS3A", topic: "Essay Writing - Narrative", objectives: "Students will write a structured narrative essay", content: "Structure of narrative essays, plot development, character introduction, setting description, use of dialogue. Review past BECE essays.", resources: "Approved English Text for JSS3, Past BECE questions" },
  { subject: "Basic Science", className: "JSS1B", topic: "The Solar System", objectives: "Students will name the planets and describe their relative positions", content: "Introduction to astronomy, the sun as our star, eight planets and their characteristics, moon phases, solar and lunar eclipses.", resources: "Basic Science for JSS1, Solar system chart" },
  { subject: "Basic Technology", className: "JSS2A", topic: "Introduction to Technical Drawing", objectives: "Students will use basic drawing tools and produce simple orthographic projections", content: "Tools and materials for technical drawing, line types, lettering, orthographic projection of simple shapes, isometric drawing basics.", resources: "Drawing board, T-square, set squares, pencils, Basic Technology textbook" },
  { subject: "Civic Education", className: "JSS2B", topic: "Rights and Responsibilities of Citizens", objectives: "Students will list fundamental rights and explain civic responsibilities", content: "Constitutional rights: right to life, freedom of expression, right to education. Responsibilities: paying taxes, voting, obeying laws. Case studies from Nigerian constitution.", resources: "Civic Education for JSS2, Nigerian Constitution" },
  { subject: "Computer Studies", className: "JSS3A", topic: "Introduction to Programming", objectives: "Students will write simple programs using pseudocode", content: "What is programming, algorithms vs programs, pseudocode syntax, flowcharts, writing pseudocode for simple problems (temperature conversion, area calculation).", resources: "Computer Studies for JSS3, Computer lab" },
  { subject: "Social Studies", className: "JSS1A", topic: "Nigeria's Cultural Heritage", objectives: "Students will describe the cultural diversity of Nigeria", content: "Major ethnic groups (Hausa, Yoruba, Igbo), traditional festivals, food culture, clothing, languages. Importance of cultural preservation.", resources: "Social Studies for JSS1, Cultural chart" },
  { subject: "Mathematics", className: "SS1A", topic: "Surds and Logarithms", objectives: "Students will simplify expressions involving surds and apply logarithm rules", content: "Definition and properties of surds, rationalization, laws of logarithms, change of base formula, applications in real life calculations.", resources: "Further Mathematics for SS1, Scientific calculator" },
  { subject: "Physics", className: "SS2A", topic: "Newton's Laws of Motion", objectives: "Students will state and apply Newton's three laws of motion", content: "First law (inertia), second law (F=ma), third law (action-reaction). Laboratory experiments demonstrating each law. Real-world applications.", resources: "Physics textbook, Laboratory equipment, Demonstration materials" },
  { subject: "Chemistry", className: "SS2B", topic: "Acids, Bases and Salts", objectives: "Students will classify substances as acids, bases or salts and perform titration", content: "Definitions, pH scale, indicators, neutralization reactions, preparation of salts, acid-base titration practical. Safety precautions.", resources: "Chemistry textbook, Titration apparatus, Indicator solutions" },
  { subject: "Biology", className: "SS1B", topic: "Cell Structure and Function", objectives: "Students will identify organelles and their functions in plant and animal cells", content: "Cell theory, microscopy techniques, organelles (nucleus, mitochondria, ribosomes, etc.), comparison of plant and animal cells, cell division basics.", resources: "Biology textbook, Microscope, Prepared slides" },
  { subject: "Literature in English", className: "SS3A", topic: "Literary Devices in African Poetry", objectives: "Students will identify and analyze literary devices in prescribed poems", content: "Analysis of poems from the WASSCE syllabus. Identify metaphor, simile, personification, alliteration. Discuss themes and poet's message.", resources: "African Poetry anthology, WASSCE past questions" },
  { subject: "Economics", className: "SS2A", topic: "Demand and Supply", objectives: "Students will explain the laws of demand and supply and determine equilibrium price", content: "Demand curve, supply curve, determinants, shifts vs movements, equilibrium analysis, government intervention (price controls). Market scenarios.", resources: "Economics for SS2, Graph paper" },
];

async function main() {
  console.log("Seeding lesson plans...");

  const teachers = await prisma.teacher.findMany({ take: 5 });
  if (teachers.length === 0) {
    console.error("No teachers found. Please seed teachers first.");
    return;
  }

  let created = 0;
  for (let i = 0; i < lessonPlans.length; i++) {
    const plan = lessonPlans[i];
    const teacher = teachers[i % teachers.length];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (i * 3));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 5);

    await prisma.lessonPlan.create({
      data: {
        teacherId: teacher.id,
        subject: plan.subject,
        className: plan.className,
        topic: plan.topic,
        objectives: plan.objectives,
        content: plan.content,
        resources: plan.resources,
        startDate,
        endDate,
        status: i < 5 ? "approved" : i < 10 ? "pending" : "draft",
      },
    });
    created++;
  }

  console.log(`Created ${created} lesson plans`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
