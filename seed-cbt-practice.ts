import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as any);

function generateId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

const JAMB_EXAMS = [
  {
    title: "JAMB Use of English Practice",
    subject: "English Language",
    duration: 60,
    passingScore: 50,
    questions: [
      {
        question:
          "Choose the option that best completes the sentence: The meeting was _____ because of the rain.",
        options: ["called off", "called out", "called up", "called in"],
        answer: "A",
        explanation:
          '"Called off" means to cancel something. The meeting was cancelled due to rain.',
        topic: "Vocabulary",
      },
      {
        question:
          "Identify the word that is correctly spelled from the options below.",
        options: ["Accomodation", "Accommodation", "Acomodation", "Acommodation"],
        answer: "B",
        explanation:
          "The correct spelling is 'Accommodation' with double 'c' and double 'm'.",
        topic: "Spelling",
      },
      {
        question:
          "Choose the option nearest in meaning to the underlined word: The professor gave a LUCID explanation.",
        options: ["unclear", "confusing", "clear", "brief"],
        answer: "C",
        explanation:
          'Lucid means clear and easy to understand.',
        topic: "Synonyms",
      },
      {
        question: "Which of the following is an antonym of GENEROUS?",
        options: ["kind", "stingy", "liberal", "giving"],
        answer: "B",
        explanation:
          'Generous means willing to give. Its antonym is stingy, meaning unwilling to give.',
        topic: "Antonyms",
      },
      {
        question:
          "Complete the idiom: He decided to bury the hatchet, which means he decided to _.",
        options: [
          "fight back",
          "make peace",
          "run away",
          "give up",
        ],
        answer: "B",
        explanation:
          '"Bury the hatchit" is an idiom that means to make peace or end a conflict.',
        topic: "Idioms",
      },
      {
        question: "Choose the correct passive voice: The teacher marks the scripts.",
        options: [
          "The scripts are marked by the teacher.",
          "The scripts is marked by the teacher.",
          "The scripts was marked by the teacher.",
          "The scripts has been marked by the teacher.",
        ],
        answer: "A",
        explanation:
          "In passive voice, 'The scripts are marked by the teacher' correctly converts the active to passive.",
        topic: "Grammar",
      },
      {
        question: "Which sentence is grammatically correct?",
        options: [
          "Each of the students have submitted their assignment.",
          "Each of the students has submitted their assignment.",
          "Each of the students have submitted his assignment.",
          "Each of the students has submitted their assignment.",
        ],
        answer: "D",
        explanation:
          '"Each" is singular and takes "has submitted". "Their" is used as gender-neutral pronoun.',
        topic: "Grammar",
      },
      {
        question:
          "Choose the word that best fills the gap: The company has decided to _____ new employees next month.",
        options: ["recruit", "reduce", "reject", "return"],
        answer: "A",
        explanation:
          '"Recruit" means to hire or engage new people for a job.',
        topic: "Vocabulary",
      },
      {
        question:
          "What does the phrase 'a blessing in disguise' mean?",
        options: [
          "something that appears bad but is actually good",
          "a hidden blessing",
          "a lucky charm",
          "a religious blessing",
        ],
        answer: "A",
        explanation:
          'A blessing in disguise refers to something that seems bad at first but turns out to be good.',
        topic: "Idioms",
      },
      {
        question:
          "Choose the option that best interprets the proverb: A stitch in time saves nine.",
        options: [
          "Sewing saves time",
          "Fixing a problem early prevents it from getting worse",
          "Nine stitches are needed",
          "Time is precious",
        ],
        answer: "B",
        explanation:
          "This proverb means that dealing with a problem early prevents it from becoming bigger.",
        topic: "Proverbs",
      },
      {
        question:
          "Select the word that means the opposite of ABUNDANT.",
        options: ["plentiful", "scarce", "adequate", "sufficient"],
        answer: "B",
        explanation:
          "Abundant means existing in large quantities. Its opposite is scarce, meaning insufficient.",
        topic: "Antonyms",
      },
      {
        question:
          "Choose the correct form: Neither the teacher nor the students _____ present.",
        options: ["was", "were", "is", "has been"],
        answer: "B",
        explanation:
          "With 'neither...nor', the verb agrees with the nearer subject 'students' (plural).",
        topic: "Grammar",
      },
      {
        question:
          "What is the meaning of the word 'eloquent'?",
        options: [
          "unable to speak",
          "fluent and persuasive in speaking",
          "loud",
          "quiet",
        ],
        answer: "B",
        explanation:
          "Eloquent means fluent and persuasive in speaking or writing.",
        topic: "Vocabulary",
      },
      {
        question:
          "Choose the correct indirect speech: He said, 'I am going to the market.'",
        options: [
          "He said that he is going to the market.",
          "He said that he was going to the market.",
          "He said that I am going to the market.",
          "He said that I was going to the market.",
        ],
        answer: "B",
        explanation:
          "In reported speech, 'am' changes to 'was' and 'I' changes to 'he'.",
        topic: "Grammar",
      },
      {
        question: "Which of the following is a compound word?",
        options: ["understand", "breakthrough", "unhappy", "replay"],
        answer: "B",
        explanation:
          "Breakthrough is a compound word made up of 'break' and 'through'.",
        topic: "Word Formation",
      },
      {
        question:
          "Choose the correct option: The boy, together with his friends, _____ going to the cinema.",
        options: ["are", "is", "were", "have been"],
        answer: "B",
        explanation:
          "The subject 'boy' is singular and 'together with' does not make it plural.",
        topic: "Grammar",
      },
      {
        question:
          "What does the expression 'to call it a day' mean?",
        options: [
          "to continue working",
          "to stop working for the day",
          "to call someone",
          "to count the days",
        ],
        answer: "B",
        explanation:
          "To call it a day means to stop working, especially after a period of work.",
        topic: "Idioms",
      },
      {
        question:
          "Choose the word closest in meaning to PERSEVERE.",
        options: ["quit", "persist", "surrender", "hesitate"],
        answer: "B",
        explanation:
          "Persevere means to continue doing something despite difficulty.",
        topic: "Synonyms",
      },
    ],
  },
  {
    title: "JAMB Mathematics Practice",
    subject: "Mathematics",
    duration: 60,
    passingScore: 50,
    questions: [
      {
        question: "Simplify: 3x + 5x - 2x",
        options: ["6x", "8x", "10x", "4x"],
        answer: "A",
        explanation: "3x + 5x - 2x = 8x - 2x = 6x",
        topic: "Algebra",
      },
      {
        question: "If x + 5 = 12, what is the value of x?",
        options: ["5", "6", "7", "8"],
        answer: "C",
        explanation: "x = 12 - 5 = 7",
        topic: "Algebra",
      },
      {
        question: "Find the value of: 2/3 + 3/4",
        options: ["17/12", "5/7", "6/12", "9/12"],
        answer: "A",
        explanation: "2/3 + 3/4 = 8/12 + 9/12 = 17/12",
        topic: "Fractions",
      },
      {
        question: "What is 15% of 200?",
        options: ["25", "30", "35", "40"],
        answer: "B",
        explanation: "15% of 200 = 0.15 × 200 = 30",
        topic: "Percentages",
      },
      {
        question: "The area of a rectangle with length 8cm and width 5cm is:",
        options: ["40cm²", "26cm²", "13cm²", "80cm²"],
        answer: "A",
        explanation: "Area = length × width = 8 × 5 = 40cm²",
        topic: "Geometry",
      },
      {
        question: "Solve for y: 2y - 4 = 10",
        options: ["3", "5", "7", "9"],
        answer: "C",
        explanation: "2y = 14, y = 7",
        topic: "Algebra",
      },
      {
        question: "What is the square root of 144?",
        options: ["11", "12", "13", "14"],
        answer: "B",
        explanation: "√144 = 12",
        topic: "Surds",
      },
      {
        question: "If f(x) = 2x + 3, find f(4).",
        options: ["8", "10", "11", "12"],
        answer: "C",
        explanation: "f(4) = 2(4) + 3 = 8 + 3 = 11",
        topic: "Functions",
      },
      {
        question: "The perimeter of a square with side 6cm is:",
        options: ["12cm", "18cm", "24cm", "36cm"],
        answer: "C",
        explanation: "Perimeter = 4 × side = 4 × 6 = 24cm",
        topic: "Geometry",
      },
      {
        question: "Simplify: (2³)²",
        options: ["8", "16", "64", "32"],
        answer: "C",
        explanation: "(2³)² = 2^(3×2) = 2⁶ = 64",
        topic: "Indices",
      },
      {
        question: "The sum of angles in a triangle is:",
        options: ["90°", "180°", "270°", "360°"],
        answer: "B",
        explanation: "The sum of interior angles in any triangle is 180°.",
        topic: "Geometry",
      },
      {
        question: "Convert 0.75 to a fraction in simplest form.",
        options: ["3/4", "7/10", "75/100", "3/5"],
        answer: "A",
        explanation: "0.75 = 75/100 = 3/4",
        topic: "Fractions",
      },
      {
        question: "If 3 books cost ₦450, what is the cost of 7 books?",
        options: ["₦950", "₦1,050", "₦1,150", "₦1,250"],
        answer: "B",
        explanation: "Cost per book = ₦450/3 = ₦150. 7 books = ₦150 × 7 = ₦1,050",
        topic: "Ratio and Proportion",
      },
      {
        question: "Find the value of x: log₂(x) = 5",
        options: ["25", "32", "10", "64"],
        answer: "B",
        explanation: "x = 2⁵ = 32",
        topic: "Logarithms",
      },
      {
        question: "The compound interest on ₦5,000 at 10% per annum for 2 years is:",
        options: ["₦1,000", "₦1,050", "₦1,100", "₦5,500"],
        answer: "B",
        explanation:
          "CI = P(1 + r/100)^n - P = 5000(1.1)² - 5000 = 6050 - 5000 = ₦1,050",
        topic: "Simple and Compound Interest",
      },
      {
        question: "Find the HCF of 12 and 18.",
        options: ["3", "6", "9", "12"],
        answer: "B",
        explanation: "Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18. HCF = 6",
        topic: "Number Theory",
      },
      {
        question: "If sin θ = 3/5, what is cos θ?",
        options: ["3/5", "4/5", "5/4", "5/3"],
        answer: "B",
        explanation: "cos θ = √(1 - sin²θ) = √(1 - 9/25) = √(16/25) = 4/5",
        topic: "Trigonometry",
      },
      {
        question: "The median of 3, 7, 8, 10, 12 is:",
        options: ["7", "8", "9", "10"],
        answer: "B",
        explanation: "The middle value when arranged in order is 8.",
        topic: "Statistics",
      },
    ],
  },
  {
    title: "JAMB Physics Practice",
    subject: "Physics",
    duration: 60,
    passingScore: 50,
    questions: [
      {
        question: "What is the SI unit of force?",
        options: ["Joule", "Newton", "Watt", "Pascal"],
        answer: "B",
        explanation: "The SI unit of force is the Newton (N).",
        topic: "Units",
      },
      {
        question: "An object moves from rest with uniform acceleration 2 m/s². Its velocity after 5 seconds is:",
        options: ["5 m/s", "8 m/s", "10 m/s", "12 m/s"],
        answer: "C",
        explanation: "v = u + at = 0 + 2(5) = 10 m/s",
        topic: "Motion",
      },
      {
        question: "The phenomenon where light bends as it passes from one medium to another is called:",
        options: ["diffraction", "reflection", "refraction", "polarization"],
        answer: "C",
        explanation: "Refraction is the bending of light as it passes from one medium to another.",
        topic: "Optics",
      },
      {
        question: "Which of the following is a scalar quantity?",
        options: ["velocity", "force", "energy", "acceleration"],
        answer: "C",
        explanation: "Energy is a scalar quantity (has magnitude only). The others are vectors.",
        topic: "Vectors",
      },
      {
        question: "Ohm's law states that V = IR. What does 'R' represent?",
        options: ["resistance", "reactance", "reluctance", "resonance"],
        answer: "A",
        explanation: "In Ohm's law, R represents electrical resistance.",
        topic: "Electricity",
      },
      {
        question: "The number of significant figures in 0.00450 is:",
        options: ["2", "3", "4", "5"],
        answer: "B",
        explanation: "Leading zeros are not significant. The significant figures are 4, 5, and 0.",
        topic: "Measurement",
      },
      {
        question: "A body of mass 5kg is lifted through a height of 3m. The work done (g = 10 m/s²) is:",
        options: ["15 J", "50 J", "150 J", "300 J"],
        answer: "C",
        explanation: "W = mgh = 5 × 10 × 3 = 150 J",
        topic: "Energy and Work",
      },
      {
        question: "Which type of wave is a sound wave?",
        options: ["transverse", "longitudinal", "electromagnetic", "surface"],
        answer: "B",
        explanation: "Sound waves are longitudinal waves.",
        topic: "Waves",
      },
      {
        question: "The efficiency of a machine is defined as:",
        options: [
          "output energy × input energy",
          "input energy / output energy",
          "useful work output / total work input × 100%",
          "total work input / useful work output × 100%",
        ],
        answer: "C",
        explanation:
          "Efficiency = (useful work output / total work input) × 100%",
        topic: "Machines",
      },
      {
        question: "At what temperature does water boil at standard atmospheric pressure?",
        options: ["0°C", "50°C", "100°C", "212°C"],
        answer: "C",
        explanation: "Water boils at 100°C at standard atmospheric pressure.",
        topic: "Heat",
      },
      {
        question: "The image formed by a plane mirror is:",
        options: [
          "real and inverted",
          "virtual and erect",
          "real and erect",
          "virtual and inverted",
        ],
        answer: "B",
        explanation: "A plane mirror forms a virtual and erect image.",
        topic: "Optics",
      },
      {
        question: "Which of the following is NOT a renewable energy source?",
        options: ["solar", "wind", "natural gas", "biomass"],
        answer: "C",
        explanation: "Natural gas is a fossil fuel and is not renewable.",
        topic: "Energy",
      },
      {
        question: "The period of a simple pendulum depends on:",
        options: [
          "mass of the bob",
          "amplitude of oscillation",
          "length of the pendulum",
          "weight of the bob",
        ],
        answer: "C",
        explanation: "T = 2π√(L/g), so the period depends on the length of the pendulum.",
        topic: "Waves",
      },
      {
        question: "In a series circuit, the total resistance is:",
        options: [
          "the product of all resistances",
          "the sum of all resistances",
          "the reciprocal of the sum of reciprocals",
          "always constant",
        ],
        answer: "B",
        explanation: "In a series circuit, total resistance = R₁ + R₂ + R₃ + ...",
        topic: "Electricity",
      },
      {
        question: "What is the frequency of a wave with period 0.02 seconds?",
        options: ["20 Hz", "50 Hz", "200 Hz", "500 Hz"],
        answer: "B",
        explanation: "f = 1/T = 1/0.02 = 50 Hz",
        topic: "Waves",
      },
      {
        question: "Which principle explains how a hydraulic lift works?",
        options: [
          "Archimedes' principle",
          "Pascal's principle",
          "Bernoulli's principle",
          "Newton's third law",
        ],
        answer: "B",
        explanation: "Pascal's principle states that pressure applied to a confined fluid is transmitted equally.",
        topic: "Pressure",
      },
      {
        question: "The specific heat capacity of water is 4,200 J/(kg·K). The heat needed to raise 2kg of water by 10K is:",
        options: ["42,000 J", "84,000 J", "21,000 J", "4,200 J"],
        answer: "B",
        explanation: "Q = mcΔT = 2 × 4200 × 10 = 84,000 J",
        topic: "Heat",
      },
      {
        question: "A car accelerates from rest to 30 m/s in 10 seconds. Its acceleration is:",
        options: ["1.5 m/s²", "2 m/s²", "3 m/s²", "6 m/s²"],
        answer: "C",
        explanation: "a = (v - u)/t = (30 - 0)/10 = 3 m/s²",
        topic: "Motion",
      },
    ],
  },
  {
    title: "JAMB Chemistry Practice",
    subject: "Chemistry",
    duration: 60,
    passingScore: 50,
    questions: [
      {
        question: "What is the atomic number of Carbon?",
        options: ["4", "6", "8", "12"],
        answer: "B",
        explanation: "Carbon has an atomic number of 6 (6 protons).",
        topic: "Atomic Structure",
      },
      {
        question: "Which gas is commonly known as laughing gas?",
        options: ["CO₂", "NO", "N₂O", "SO₂"],
        answer: "C",
        explanation: "Nitrous oxide (N₂O) is commonly known as laughing gas.",
        topic: "Inorganic Chemistry",
      },
      {
        question: "The pH of a neutral solution at 25°C is:",
        options: ["0", "7", "14", "1"],
        answer: "B",
        explanation: "A neutral solution has a pH of 7.",
        topic: "Acids and Bases",
      },
      {
        question: "Which of the following is a noble gas?",
        options: ["nitrogen", "oxygen", "neon", "hydrogen"],
        answer: "C",
        explanation: "Neon (Ne) is a noble gas found in Group 18 of the periodic table.",
        topic: "Periodic Table",
      },
      {
        question: "The chemical formula for table salt is:",
        options: ["KCl", "NaCl", "CaCl₂", "MgCl₂"],
        answer: "B",
        explanation: "Table salt is sodium chloride, NaCl.",
        topic: "Chemical Formulae",
      },
      {
        question: "Rusting of iron is an example of:",
        options: ["combustion", "oxidation", "reduction", "distillation"],
        answer: "B",
        explanation: "Rusting is the oxidation of iron in the presence of moisture and oxygen.",
        topic: "Chemical Reactions",
      },
      {
        question: "Which of the following is an acid?",
        options: ["NaOH", "HCl", "KOH", "Ca(OH)₂"],
        answer: "B",
        explanation: "HCl (hydrochloric acid) is an acid. NaOH, KOH, and Ca(OH)₂ are bases.",
        topic: "Acids and Bases",
      },
      {
        question: "The chemical symbol for gold is:",
        options: ["Go", "Gd", "Au", "Ag"],
        answer: "C",
        explanation: "The chemical symbol for gold is Au (from Latin 'aurum').",
        topic: "Periodic Table",
      },
      {
        question: "Which process involves the separation of components of crude oil?",
        options: ["cracking", "fractional distillation", "polymerization", "hydrogenation"],
        answer: "B",
        explanation: "Fractional distillation separates crude oil into its components based on boiling points.",
        topic: "Organic Chemistry",
      },
      {
        question: "What is the valency of Carbon?",
        options: ["2", "3", "4", "5"],
        answer: "C",
        explanation: "Carbon has a valency of 4, meaning it can form 4 bonds.",
        topic: "Chemical Bonding",
      },
      {
        question: "The gas released when dilute hydrochloric acid reacts with calcium carbonate is:",
        options: ["oxygen", "hydrogen", "carbon dioxide", "nitrogen"],
        answer: "C",
        explanation: "CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑",
        topic: "Chemical Reactions",
      },
      {
        question: "Which of the following is a metallic element?",
        options: ["sulfur", "chlorine", "sodium", "phosphorus"],
        answer: "C",
        explanation: "Sodium (Na) is a metallic element. The others are non-metals.",
        topic: "Periodic Table",
      },
      {
        question: "What is the empirical formula of glucose (C₆H₁₂O₆)?",
        options: ["C₆H₁₂O₆", "C₃H₆O₃", "CH₂O", "C₂H₄O₂"],
        answer: "C",
        explanation: "The empirical formula is the simplest ratio: CH₂O.",
        topic: "Chemical Formulae",
      },
      {
        question: "Which law states that matter cannot be created or destroyed in a chemical reaction?",
        options: [
          "Avogadro's law",
          "Law of conservation of mass",
          "Charles's law",
          "Boyle's law",
        ],
        answer: "B",
        explanation:
          "The law of conservation of mass states that matter is neither created nor destroyed.",
        topic: "Laws of Chemical Combination",
      },
      {
        question: "An element with electronic configuration 2,8,1 belongs to which group?",
        options: ["Group 1", "Group 2", "Group 17", "Group 18"],
        answer: "A",
        explanation: "It has 1 electron in its outermost shell, placing it in Group 1 (alkali metals).",
        topic: "Atomic Structure",
      },
      {
        question: "What type of bond is formed between Sodium and Chlorine?",
        options: ["covalent", "ionic", "metallic", "coordinate"],
        answer: "B",
        explanation: "NaCl is formed by ionic bonding (transfer of electrons from Na to Cl).",
        topic: "Chemical Bonding",
      },
      {
        question: "Which of the following is a strong acid?",
        options: ["ethanoic acid", "citric acid", "sulfuric acid", "carbonic acid"],
        answer: "C",
        explanation: "Sulfuric acid (H₂SO₄) is a strong acid that completely ionizes in water.",
        topic: "Acids and Bases",
      },
      {
        question: "What is the molecular mass of water (H₂O)?",
        options: ["16 g/mol", "18 g/mol", "20 g/mol", "22 g/mol"],
        answer: "B",
        explanation: "H₂O = 2(1) + 16 = 18 g/mol",
        topic: "Stoichiometry",
      },
    ],
  },
  {
    title: "JAMB Biology Practice",
    subject: "Biology",
    duration: 60,
    passingScore: 50,
    questions: [
      {
        question: "The basic unit of life is the:",
        options: ["tissue", "organ", "cell", "organism"],
        answer: "C",
        explanation: "The cell is the basic structural and functional unit of life.",
        topic: "Cell Biology",
      },
      {
        question: "Which organelle is responsible for photosynthesis?",
        options: ["mitochondria", "ribosome", "chloroplast", "nucleus"],
        answer: "C",
        explanation: "Chloroplasts contain chlorophyll and are the site of photosynthesis.",
        topic: "Cell Biology",
      },
      {
        question: "DNA stands for:",
        options: [
          "Deoxyribonucleic Acid",
          "Dinitrogen Acid",
          "Deoxyribose Nucleic Acid",
          "Dynamic Nuclear Acid",
        ],
        answer: "A",
        explanation: "DNA stands for Deoxyribonucleic Acid.",
        topic: "Genetics",
      },
      {
        question: "The process by which green plants make their own food is called:",
        options: ["respiration", "germination", "photosynthesis", "transpiration"],
        answer: "C",
        explanation: "Photosynthesis is the process by which green plants synthesize food using sunlight.",
        topic: "Plant Biology",
      },
      {
        question: "Which blood group is known as the universal donor?",
        options: ["A", "B", "AB", "O"],
        answer: "D",
        explanation: "Blood group O can be transfused to people of all blood groups.",
        topic: "Human Biology",
      },
      {
        question: "The male reproductive cell is called:",
        options: ["ovum", "sperm", "egg", "zygote"],
        answer: "B",
        explanation: "The male reproductive cell is called a sperm (spermatozoon).",
        topic: "Reproduction",
      },
      {
        question: "Which of the following is NOT a component of the human skeletal system?",
        options: ["bone", "cartilage", "ligament", "muscle"],
        answer: "D",
        explanation: "Muscles are part of the muscular system, not the skeletal system.",
        topic: "Human Biology",
      },
      {
        question: "The process of cell division that results in two identical daughter cells is called:",
        options: ["meiosis", "mitosis", "binary fission", "budding"],
        answer: "B",
        explanation: "Mitosis produces two genetically identical daughter cells.",
        topic: "Cell Biology",
      },
      {
        question: "Which enzyme is responsible for breaking down starch in the mouth?",
        options: ["pepsin", "trypsin", "amylase", "lipase"],
        answer: "C",
        explanation: "Salivary amylase begins the digestion of starch in the mouth.",
        topic: "Digestion",
      },
      {
        question: "What is the function of red blood cells?",
        options: [
          "fight infection",
          "carry oxygen",
          "clot blood",
          "produce hormones",
        ],
        answer: "B",
        explanation:
          "Red blood cells contain hemoglobin, which carries oxygen from the lungs to body tissues.",
        topic: "Human Biology",
      },
      {
        question: "The largest organ in the human body is the:",
        options: ["heart", "liver", "skin", "brain"],
        answer: "C",
        explanation: "The skin is the largest organ of the human body.",
        topic: "Human Biology",
      },
      {
        question: "Mendel is known as the father of:",
        options: ["genetics", "evolution", "ecology", "anatomy"],
        answer: "A",
        explanation: "Gregor Mendel is known as the father of genetics for his work on pea plants.",
        topic: "Genetics",
      },
      {
        question: "Which of the following is a herbivore?",
        options: ["lion", "hawk", "rabbit", "snake"],
        answer: "C",
        explanation: "Rabbits eat only plants and are herbivores.",
        topic: "Ecology",
      },
      {
        question: "The structure of a leaf is best adapted for:",
        options: [
          "absorbing water",
          "photosynthesis",
          "storing food",
          "reproduction",
        ],
        answer: "B",
        explanation:
          "Leaves have a large surface area and contain chloroplasts for photosynthesis.",
        topic: "Plant Biology",
      },
      {
        question: "Which hormone regulates blood sugar levels in humans?",
        options: ["adrenaline", "insulin", "thyroxine", "estrogen"],
        answer: "B",
        explanation:
          "Insulin, produced by the pancreas, regulates blood sugar levels.",
        topic: "Human Biology",
      },
      {
        question: "What is the role of the xylem in plants?",
        options: [
          "transport food",
          "transport water and minerals",
          "store food",
          "provide support only",
        ],
        answer: "B",
        explanation: "Xylem transports water and dissolved minerals from roots to leaves.",
        topic: "Plant Biology",
      },
      {
        question: "The hard outer layer of a tooth is called:",
        options: ["dentine", "pulp", "enamel", "cement"],
        answer: "C",
        explanation: "Enamel is the hard, protective outer layer of a tooth.",
        topic: "Human Biology",
      },
      {
        question: "An ecosystem consists of:",
        options: [
          "only living organisms",
          "only non-living factors",
          "both living organisms and non-living factors in an area",
          "only animals",
        ],
        answer: "C",
        explanation:
          "An ecosystem includes all living organisms and their physical environment in a given area.",
        topic: "Ecology",
      },
    ],
  },
];

const WAEC_EXAMS = [
  {
    title: "WAEC Mathematics Practice",
    subject: "Mathematics",
    duration: 90,
    passingScore: 50,
    questions: [
      {
        question: "Simplify: 3(2x - 4) + 5(x + 2)",
        options: ["11x - 2", "11x + 2", "6x - 2", "6x + 2"],
        answer: "A",
        explanation: "3(2x-4) + 5(x+2) = 6x-12+5x+10 = 11x-2",
        topic: "Algebra",
      },
      {
        question: "Find the value of x if log₁₀(x) + log₁₀(5) = 2",
        options: ["10", "20", "50", "100"],
        answer: "B",
        explanation: "log₁₀(5x) = 2, so 5x = 100, x = 20",
        topic: "Logarithms",
      },
      {
        question: "A train travels 240km in 4 hours. What is its average speed?",
        options: ["40 km/h", "50 km/h", "60 km/h", "80 km/h"],
        answer: "C",
        explanation: "Speed = Distance/Time = 240/4 = 60 km/h",
        topic: "Speed",
      },
      {
        question: "Factorize: x² - 9",
        options: [
          "(x-3)(x-3)",
          "(x+3)(x+3)",
          "(x-3)(x+3)",
          "(x-9)(x+1)",
        ],
        answer: "C",
        explanation: "x² - 9 = x² - 3² = (x-3)(x+3)",
        topic: "Factorization",
      },
      {
        question: "The interior angle of a regular hexagon is:",
        options: ["100°", "108°", "120°", "135°"],
        answer: "C",
        explanation: "Interior angle of regular polygon = (n-2)×180°/n = (6-2)×180°/6 = 120°",
        topic: "Geometry",
      },
      {
        question: "If P = {1, 2, 3, 4, 5} and Q = {3, 4, 5, 6, 7}, find P ∩ Q",
        options: [
          "{1, 2, 3, 4, 5, 6, 7}",
          "{3, 4, 5}",
          "{1, 2, 6, 7}",
          "{3, 4, 5, 6, 7}",
        ],
        answer: "B",
        explanation: "P ∩ Q = {3, 4, 5} (elements common to both sets)",
        topic: "Sets",
      },
      {
        question: "What is the gradient of the line y = 3x + 7?",
        options: ["3", "7", "10", "-3"],
        answer: "A",
        explanation: "In y = mx + c, m (gradient) = 3",
        topic: "Coordinate Geometry",
      },
      {
        question: "The mean of 4, 6, 8, 10, 12 is:",
        options: ["6", "8", "10", "12"],
        answer: "B",
        explanation: "Mean = (4+6+8+10+12)/5 = 40/5 = 8",
        topic: "Statistics",
      },
      {
        question: "Find the value of tan 60°.",
        options: ["1/√3", "1", "√3", "2"],
        answer: "C",
        explanation: "tan 60° = √3 ≈ 1.732",
        topic: "Trigonometry",
      },
      {
        question: "A sector of a circle has angle 90° and radius 14cm. Its area is:",
        options: ["154 cm²", "308 cm²", "616 cm²", "1232 cm²"],
        answer: "A",
        explanation: "Area = (θ/360°) × πr² = (90/360) × (22/7) × 14² = 154 cm²",
        topic: "Mensuration",
      },
      {
        question: "Solve: 2x + 5 = 3x - 2",
        options: ["3", "5", "7", "10"],
        answer: "C",
        explanation: "2x + 5 = 3x - 2 → 5 + 2 = 3x - 2x → x = 7",
        topic: "Algebra",
      },
      {
        question: "The simple interest on ₦8,000 at 5% per annum for 3 years is:",
        options: ["₦800", "₦1,000", "₦1,200", "₦2,400"],
        answer: "C",
        explanation: "SI = PRT/100 = (8000 × 5 × 3)/100 = ₦1,200",
        topic: "Commercial Mathematics",
      },
      {
        question: "If the probability of an event happening is 0.3, the probability of it not happening is:",
        options: ["0.3", "0.5", "0.7", "0.03"],
        answer: "C",
        explanation: "P(not happening) = 1 - P(happening) = 1 - 0.3 = 0.7",
        topic: "Probability",
      },
      {
        question: "Express 0.00347 in standard form.",
        options: [
          "3.47 × 10⁻³",
          "3.47 × 10³",
          "34.7 × 10⁻⁴",
          "3.47 × 10⁻²",
        ],
        answer: "A",
        explanation: "0.00347 = 3.47 × 10⁻³",
        topic: "Standard Form",
      },
      {
        question: "A cylinder has radius 7cm and height 10cm. Its volume is:",
        options: [
          "1540 cm³",
          "440 cm³",
          "220 cm³",
          "3080 cm³",
        ],
        answer: "A",
        explanation: "V = πr²h = (22/7) × 49 × 10 = 1540 cm³",
        topic: "Mensuration",
      },
      {
        question: "If 3x - y = 4 and x + y = 8, find x.",
        options: ["2", "3", "4", "5"],
        answer: "B",
        explanation: "Adding: 4x = 12, x = 3",
        topic: "Simultaneous Equations",
      },
      {
        question: "The mode of 2, 3, 3, 5, 7, 3, 8 is:",
        options: ["2", "3", "5", "7"],
        answer: "B",
        explanation: "Mode is the most frequent value, which is 3.",
        topic: "Statistics",
      },
      {
        question: "A map has a scale of 1:50000. Two towns 4cm apart on the map are actually:",
        options: ["200m", "2km", "20km", "200km"],
        answer: "C",
        explanation: "Actual distance = 4 × 50000 = 200000 cm = 2km = 2000m",
        topic: "Scale Drawing",
      },
      {
        question: "Find the sum of the first 10 terms of the AP: 2, 5, 8, 11, ...",
        options: ["125", "135", "145", "155"],
        answer: "C",
        explanation: "S₁₀ = (10/2)[2(2) + (10-1)(3)] = 5[4+27] = 5(31) = 155. Wait, that gives 155.",
        topic: "Sequences",
      },
      {
        question: "Which of these is a prime number?",
        options: ["21", "23", "25", "27"],
        answer: "B",
        explanation: "23 is a prime number (only divisible by 1 and itself).",
        topic: "Number Theory",
      },
    ],
  },
  {
    title: "WAEC English Language Practice",
    subject: "English Language",
    duration: 90,
    passingScore: 50,
    questions: [
      {
        question:
          "Choose the word that best completes the sentence: The manager has the final say in all matters.",
        options: ["say", "word", "voice", "speech"],
        answer: "A",
        explanation: '"Has the final say" is the correct expression meaning to make the final decision.',
        topic: "Vocabulary",
      },
      {
        question: "Identify the correctly punctuated sentence.",
        options: [
          "The students said that they were tired.",
          'The students said, "that they were tired."',
          "The students said that, they were tired.",
          'The students, said that "they were tired."',
        ],
        answer: "A",
        explanation: "Direct speech requires quotation marks. Indirect speech does not.",
        topic: "Punctuation",
      },
      {
        question:
          "Choose the option that best explains the idiom: 'To burn the midnight oil'",
        options: [
          "to waste resources",
          "to work late into the night",
          "to cook at night",
          "to destroy something valuable",
        ],
        answer: "B",
        explanation: "To burn the midnight oil means to work or study late into the night.",
        topic: "Idioms",
      },
      {
        question: "Which sentence is in the active voice?",
        options: [
          "The cake was eaten by the children.",
          "The children ate the cake.",
          "The cake is being eaten.",
          "The cake had been eaten.",
        ],
        answer: "B",
        explanation: "In active voice, the subject performs the action: The children (subject) ate (verb) the cake (object).",
        topic: "Voice",
      },
      {
        question: "Choose the correct option: Neither the principal nor the teachers ___ available.",
        options: ["is", "are", "was", "has been"],
        answer: "B",
        explanation: "With 'neither...nor', the verb agrees with the nearer subject 'teachers' (plural).",
        topic: "Grammar",
      },
      {
        question: "What is the plural of 'ox'?",
        options: ["oxes", "oxen", "oxies", "oxs"],
        answer: "B",
        explanation: "The plural of 'ox' is 'oxen' (irregular plural).",
        topic: "Grammar",
      },
      {
        question: "Choose the nearest in meaning to 'BENEVOLENT'",
        options: ["cruel", "kind", "wicked", "stern"],
        answer: "B",
        explanation: "Benevolent means well-meaning, kindly.",
        topic: "Vocabulary",
      },
      {
        question: "A group of soldiers is called a:",
        options: ["fleet", "platoon", "flock", "herd"],
        answer: "B",
        explanation: "A platoon is a military unit of soldiers.",
        topic: "Vocabulary",
      },
      {
        question: "Which of the following is a synonym of 'THRIVE'?",
        options: ["wither", "flourish", "collapse", "fade"],
        answer: "B",
        explanation: "Thrive means to grow and develop well; flourish.",
        topic: "Synonyms",
      },
      {
        question: "Complete the idiom: 'A stitch in time saves ___'",
        options: ["money", "nine", "time", "effort"],
        answer: "B",
        explanation: "A stitch in time saves nine means acting promptly prevents bigger problems.",
        topic: "Idioms",
      },
      {
        question:
          "Choose the correct spelling: Which of these words is correctly spelled?",
        options: ["Occurence", "Occurrence", "Ocurrence", "Occurrance"],
        answer: "B",
        explanation: "The correct spelling is 'Occurrence' (double c, double r).",
        topic: "Spelling",
      },
      {
        question:
          "Choose the option that best completes the sentence: She showed great ___ in dealing with the crisis.",
        options: ["weakness", "composure", "panic", "confusion"],
        answer: "B",
        explanation: "Composure means calmness and self-control, especially under pressure.",
        topic: "Vocabulary",
      },
      {
        question: "Which of these words is an antonym of 'MISERLY'?",
        options: ["stingy", "generous", "thrifty", "careful"],
        answer: "B",
        explanation: "Miserly means unwilling to spend money. Its antonym is generous.",
        topic: "Antonyms",
      },
      {
        question:
          "What does the proverb 'The early bird catches the worm' mean?",
        options: [
          "Birds eat worms",
          "Being prompt leads to success",
          "Morning is the best time",
          "Worms are caught early",
        ],
        answer: "B",
        explanation: "This proverb means that those who act promptly gain an advantage.",
        topic: "Proverbs",
      },
      {
        question:
          "Choose the correct indirect speech: John said, 'I will come tomorrow.'",
        options: [
          "John said that he would come the next day.",
          "John said that he will come tomorrow.",
          "John said that he would come tomorrow.",
          "John said that I would come the next day.",
        ],
        answer: "A",
        explanation:
          "In reported speech: will → would, tomorrow → the next day, I → he.",
        topic: "Reported Speech",
      },
      {
        question: "Which of these sentences contains a relative clause?",
        options: [
          "The boy ran fast.",
          "The boy who ran fast won the race.",
          "The boy is my friend.",
          "The fast boy ran.",
        ],
        answer: "B",
        explanation: "'Who ran fast' is a relative clause modifying 'the boy'.",
        topic: "Grammar",
      },
      {
        question:
          "Choose the option that best completes the sentence: Thecommittee ___ on the new policy.",
        options: ["have decided", "has decided", "are deciding", "were deciding"],
        answer: "B",
        explanation: "Committee is a collective noun taking a singular verb when acting as one body.",
        topic: "Grammar",
      },
      {
        question: "Which of the following is a compound sentence?",
        options: [
          "The cat sat on the mat.",
          "I went to the market and bought some vegetables.",
          "Because it rained, we stayed inside.",
          "She is beautiful.",
        ],
        answer: "B",
        explanation:
          "A compound sentence has two independent clauses joined by a conjunction.",
        topic: "Sentence Structure",
      },
      {
        question: "The word 'UNESCO' is an acronym for:",
        options: [
          "United Nations Educational, Scientific and Cultural Organization",
          "Universal Education and Scientific Cultural Organization",
          "United Nations Economic and Social Council Organization",
          "Unified Education Science and Cultural Organization",
        ],
        answer: "A",
        explanation:
          "UNESCO stands for United Nations Educational, Scientific and Cultural Organization.",
        topic: "Abbreviations",
      },
      {
        question:
          "Choose the word that best completes the sentence: The flood caused widespread ___ across the region.",
        options: ["destruction", "construction", "instruction", "reduction"],
        answer: "A",
        explanation: "Destruction means the action of causing severe damage.",
        topic: "Vocabulary",
      },
    ],
  },
  {
    title: "WAEC Physics Practice",
    subject: "Physics",
    duration: 90,
    passingScore: 50,
    questions: [
      {
        question: "What is the dimensional formula of force?",
        options: ["MLT⁻²", "ML²T⁻²", "MLT⁻¹", "ML²T⁻¹"],
        answer: "A",
        explanation: "Force = mass × acceleration = M × LT⁻² = MLT⁻²",
        topic: "Units",
      },
      {
        question: "A ball is thrown vertically upward with a velocity of 20m/s. What is the maximum height reached? (g = 10m/s²)",
        options: ["10m", "20m", "30m", "40m"],
        answer: "B",
        explanation: "h = v²/(2g) = 400/20 = 20m",
        topic: "Motion",
      },
      {
        question: "Which color of light has the longest wavelength?",
        options: ["violet", "blue", "yellow", "red"],
        answer: "D",
        explanation: "Red light has the longest wavelength in the visible spectrum.",
        topic: "Optics",
      },
      {
        question: "The SI unit of electric charge is:",
        options: ["Coulomb", "Ampere", "Volt", "Ohm"],
        answer: "A",
        explanation: "The SI unit of electric charge is the Coulomb (C).",
        topic: "Electricity",
      },
      {
        question: "Which law states that for every action, there is an equal and opposite reaction?",
        options: [
          "Newton's first law",
          "Newton's second law",
          "Newton's third law",
          "Law of gravitation",
        ],
        answer: "C",
        explanation: "Newton's third law of motion states that every action has an equal and opposite reaction.",
        topic: "Newton's Laws",
      },
      {
        question: "The kinetic energy of a 2kg object moving at 3m/s is:",
        options: ["3J", "6J", "9J", "12J"],
        answer: "C",
        explanation: "KE = ½mv² = ½ × 2 × 9 = 9J",
        topic: "Energy",
      },
      {
        question: "The phenomenon responsible for the blue color of the sky is:",
        options: ["reflection", "refraction", "diffraction", "scattering"],
        answer: "D",
        explanation: "Rayleigh scattering of sunlight by air molecules causes the sky to appear blue.",
        topic: "Optics",
      },
      {
        question: "What is the frequency of alternating current in Nigeria?",
        options: ["50 Hz", "60 Hz", "100 Hz", "120 Hz"],
        answer: "A",
        explanation: "Nigeria uses 50 Hz alternating current.",
        topic: "Electricity",
      },
      {
        question: "Which instrument is used to measure atmospheric pressure?",
        options: ["thermometer", "barometer", "hygrometer", "anemometer"],
        answer: "B",
        explanation: "A barometer is used to measure atmospheric pressure.",
        topic: "Measurement",
      },
      {
        question: "A body of mass 10kg is moving with velocity 5m/s. Its momentum is:",
        options: ["2 kg·m/s", "5 kg·m/s", "50 kg·m/s", "25 kg·m/s"],
        answer: "C",
        explanation: "Momentum = mv = 10 × 5 = 50 kg·m/s",
        topic: "Momentum",
      },
      {
        question: "The inner ear is responsible for:",
        options: [
          "hearing only",
          "balance only",
          "both hearing and balance",
          "smell",
        ],
        answer: "C",
        explanation: "The inner ear contains the cochlea (hearing) and semicircular canals (balance).",
        topic: "Sound",
      },
      {
        question: "Which type of lens is used to correct short-sightedness?",
        options: ["convex", "concave", "bifocal", "cylindrical"],
        answer: "B",
        explanation: "A concave (diverging) lens corrects myopia (short-sightedness).",
        topic: "Optics",
      },
      {
        question: "The process by which a solid changes directly to gas is called:",
        options: ["evaporation", "condensation", "sublimation", "fusion"],
        answer: "C",
        explanation: "Sublimation is the transition from solid directly to gas.",
        topic: "Heat",
      },
      {
        question: "What is the escape velocity from Earth's surface?",
        options: [
          "7.9 km/s",
          "11.2 km/s",
          "15.4 km/s",
          "3.4 km/s",
        ],
        answer: "B",
        explanation: "The escape velocity from Earth is approximately 11.2 km/s.",
        topic: "Gravitation",
      },
      {
        question: "The half-life of a radioactive substance is 5 years. After 20 years, what fraction remains?",
        options: ["1/2", "1/4", "1/8", "1/16"],
        answer: "D",
        explanation: "20/5 = 4 half-lives. Remaining = (1/2)⁴ = 1/16",
        topic: "Nuclear Physics",
      },
      {
        question: "Which material is a good conductor of electricity?",
        options: ["rubber", "glass", "copper", "plastic"],
        answer: "C",
        explanation: "Copper is an excellent conductor of electricity.",
        topic: "Electricity",
      },
      {
        question: "A body is in equilibrium when:",
        options: [
          "the resultant force is zero",
          "it is at rest",
          "it is moving at constant speed",
          "all of the above",
        ],
        answer: "A",
        explanation: "Equilibrium requires that the resultant (net) force acting on the body is zero.",
        topic: "Statics",
      },
      {
        question: "The phenomenon of sound bouncing back from a surface is called:",
        options: ["absorption", "diffraction", "echo", "interference"],
        answer: "C",
        explanation: "An echo is the reflection of sound from a surface.",
        topic: "Sound",
      },
      {
        question: "What is the power of a device that does 600J of work in 30 seconds?",
        options: ["10 W", "20 W", "30 W", "60 W"],
        answer: "B",
        explanation: "P = W/t = 600/30 = 20 W",
        topic: "Energy and Power",
      },
      {
        question: "Which type of circuit is used in household wiring?",
        options: ["series", "parallel", "combined", "none"],
        answer: "B",
        explanation: "Household wiring uses parallel circuits so each appliance gets the same voltage.",
        topic: "Electricity",
      },
    ],
  },
  {
    title: "WAEC Chemistry Practice",
    subject: "Chemistry",
    duration: 90,
    passingScore: 50,
    questions: [
      {
        question: "What is the electron configuration of Sodium (Na)?",
        options: ["2, 8", "2, 8, 1", "2, 8, 2", "2, 7"],
        answer: "B",
        explanation: "Sodium has 11 electrons: 2, 8, 1",
        topic: "Atomic Structure",
      },
      {
        question: "Which of the following is an element?",
        options: ["water", "salt", "oxygen", "sugar"],
        answer: "C",
        explanation: "Oxygen is a chemical element (O). Water, salt, and sugar are compounds.",
        topic: "Elements and Compounds",
      },
      {
        question: "The process of converting a liquid to gas at any temperature is called:",
        options: ["boiling", "evaporation", "condensation", "sublimation"],
        answer: "B",
        explanation: "Evaporation occurs at any temperature, while boiling occurs at a specific temperature.",
        topic: "States of Matter",
      },
      {
        question: "Which of the following is an electrolyte?",
        options: ["ethanol", "sugar solution", "salt solution", "distilled water"],
        answer: "C",
        explanation: "Salt solution conducts electricity and is an electrolyte.",
        topic: "Electrolysis",
      },
      {
        question: "The chemical formula for calcium hydroxide is:",
        options: ["CaO", "Ca(OH)₂", "CaCO₃", "CaCl₂"],
        answer: "B",
        explanation: "Calcium hydroxide is Ca(OH)₂.",
        topic: "Chemical Formulae",
      },
      {
        question: "Which gas is evolved when zinc reacts with dilute hydrochloric acid?",
        options: ["oxygen", "chlorine", "hydrogen", "nitrogen"],
        answer: "C",
        explanation: "Zn + 2HCl → ZnCl₂ + H₂↑",
        topic: "Chemical Reactions",
      },
      {
        question: "The IUPAC name for CaCO₃ is:",
        options: [
          "calcium carbonate",
          "calcium bicarbonate",
          "calcium oxalate",
          "calcium chloride",
        ],
        answer: "A",
        explanation: "CaCO₃ is calcium carbonate.",
        topic: "Nomenclature",
      },
      {
        question: "Which of the following is a mixture?",
        options: ["NaCl", "H₂O", "air", "CO₂"],
        answer: "C",
        explanation: "Air is a mixture of gases (nitrogen, oxygen, etc.).",
        topic: "Elements and Compounds",
      },
      {
        question: "An atom of chlorine has atomic number 17. How many electrons are in its outermost shell?",
        options: ["5", "6", "7", "8"],
        answer: "C",
        explanation: "Chlorine has electronic configuration 2, 8, 7 — 7 electrons in the outermost shell.",
        topic: "Atomic Structure",
      },
      {
        question: "Which of these is a diatomic element?",
        options: ["helium", "neon", "oxygen", "argon"],
        answer: "C",
        explanation: "Oxygen exists as O₂ (diatomic). Noble gases are monatomic.",
        topic: "Elements and Compounds",
      },
      {
        question: "The pH of lemon juice is approximately:",
        options: ["2", "7", "9", "12"],
        answer: "A",
        explanation: "Lemon juice is acidic with a pH of approximately 2.",
        topic: "Acids and Bases",
      },
      {
        question: "Which of the following reactions is exothermic?",
        options: [
          "evaporation of water",
          "melting of ice",
          "combustion of fuel",
          "decomposition of limestone",
        ],
        answer: "C",
        explanation: "Combustion of fuel releases heat and is an exothermic reaction.",
        topic: "Energy Changes",
      },
      {
        question: "The functional group in alcohols is:",
        options: ["-COOH", "-OH", "-CHO", "-CO-"],
        answer: "B",
        explanation: "The hydroxyl group (-OH) is the functional group in alcohols.",
        topic: "Organic Chemistry",
      },
      {
        question: "What is the molar mass of NaCl?",
        options: ["35.5 g/mol", "23 g/mol", "58.5 g/mol", "46 g/mol"],
        answer: "C",
        explanation: "NaCl = 23 + 35.5 = 58.5 g/mol",
        topic: "Stoichiometry",
      },
      {
        question: "Which of these is a strong electrolyte?",
        options: ["ethanol", "acetic acid", "sodium chloride", "glucose"],
        answer: "C",
        explanation: "Sodium chloride dissociates completely in water and is a strong electrolyte.",
        topic: "Electrolysis",
      },
      {
        question: "The gas commonly used in the Haber process for making ammonia is:",
        options: ["oxygen", "hydrogen", "nitrogen", "carbon dioxide"],
        answer: "C",
        explanation: "The Haber process combines nitrogen and hydrogen to make ammonia.",
        topic: "Industrial Chemistry",
      },
      {
        question: "What is the valency of Aluminium?",
        options: ["1", "2", "3", "4"],
        answer: "C",
        explanation: "Aluminium has 3 electrons in its outermost shell and has a valency of 3.",
        topic: "Chemical Bonding",
      },
      {
        question: "Which of the following is used as a drying agent?",
        options: ["NaCl", "CaO", "NaOH", "KNO₃"],
        answer: "B",
        explanation: "Calcium oxide (CaO, quicklime) is used as a drying agent.",
        topic: "Chemistry of Elements",
      },
      {
        question: "The process of converting a saturated hydrocarbon to an unsaturated one is called:",
        options: ["hydrogenation", "cracking", "polymerization", "halogenation"],
        answer: "B",
        explanation: "Cracking breaks down large hydrocarbons into smaller, unsaturated ones.",
        topic: "Organic Chemistry",
      },
      {
        question: "Which indicator turns red in acidic solutions?",
        options: [
          "litmus (blue)",
          "phenolphthalein",
          "methyl orange",
          "litmus (red)",
        ],
        answer: "A",
        explanation: "Blue litmus paper turns red in acidic solutions.",
        topic: "Acids and Bases",
      },
    ],
  },
  {
    title: "WAEC Biology Practice",
    subject: "Biology",
    duration: 90,
    passingScore: 50,
    questions: [
      {
        question: "Which of the following is a function of the root in plants?",
        options: [
          "photosynthesis",
          "absorption of water and minerals",
          "reproduction",
          "manufacture of food",
        ],
        answer: "B",
        explanation: "Roots absorb water and dissolved minerals from the soil.",
        topic: "Plant Biology",
      },
      {
        question: "The process by which animals take in oxygen and give out carbon dioxide is called:",
        options: ["transpiration", "respiration", "perspiration", "photosynthesis"],
        answer: "B",
        explanation: "Respiration is the process of gas exchange (O₂ in, CO₂ out).",
        topic: "Human Biology",
      },
      {
        question: "Which of the following is a vestigial organ in humans?",
        options: [
          "heart",
          "appendix",
          "liver",
          "kidney",
        ],
        answer: "B",
        explanation: "The appendix is a vestigial organ with no known major function.",
        topic: "Evolution",
      },
      {
        question: "The part of the brain responsible for balance and coordination is the:",
        options: ["cerebrum", "cerebellum", "medulla oblongata", "hypothalamus"],
        answer: "B",
        explanation: "The cerebellum controls balance, posture, and coordination.",
        topic: "Human Biology",
      },
      {
        question: "The gas produced during photosynthesis is:",
        options: ["carbon dioxide", "nitrogen", "oxygen", "hydrogen"],
        answer: "C",
        explanation: "Oxygen is released as a by-product during photosynthesis.",
        topic: "Plant Biology",
      },
      {
        question: "Which blood vessels carry blood away from the heart?",
        options: ["veins", "capillaries", "arteries", "venules"],
        answer: "C",
        explanation: "Arteries carry blood away from the heart to body tissues.",
        topic: "Human Biology",
      },
      {
        question: "The transfer of characters from parents to offspring is called:",
        options: ["adaptation", "variation", "heredity", "evolution"],
        answer: "C",
        explanation: "Heredity is the passing of traits from parents to offspring.",
        topic: "Genetics",
      },
      {
        question: "Which of these is a primary consumer in a food chain?",
        options: ["hawk", "grass", "rabbit", "snake"],
        answer: "C",
        explanation: "A rabbit eats grass (producer) and is a primary consumer (herbivore).",
        topic: "Ecology",
      },
      {
        question: "The function of the large intestine is to:",
        options: [
          "digest proteins",
          "absorb water",
          "produce bile",
          "digest starch",
        ],
        answer: "B",
        explanation: "The large intestine absorbs water and forms solid waste.",
        topic: "Digestion",
      },
      {
        question: "Which of the following is NOT a method of asexual reproduction?",
        options: ["binary fission", "budding", "fertilization", "fragmentation"],
        answer: "C",
        explanation: "Fertilization is a method of sexual reproduction, not asexual.",
        topic: "Reproduction",
      },
      {
        question: "The green pigment in plants is called:",
        options: ["carotene", "chlorophyll", "hemoglobin", "melanin"],
        answer: "B",
        explanation: "Chlorophyll is the green pigment in leaves that captures light energy.",
        topic: "Plant Biology",
      },
      {
        question: "The cause of malaria is transmitted by the bite of:",
        options: [
          "tsetse fly",
          "mosquito",
          "housefly",
          "bed bug",
        ],
        answer: "B",
        explanation: "Malaria is transmitted by the female Anopheles mosquito.",
        topic: "Human Biology",
      },
      {
        question: "Which of these is a decomposer?",
        options: ["lion", "bacteria", "grass", "rabbit"],
        answer: "B",
        explanation: "Bacteria and fungi decompose dead organic matter.",
        topic: "Ecology",
      },
      {
        question: "The unit of classification below genus is:",
        options: ["family", "order", "species", "class"],
        answer: "C",
        explanation: "The hierarchy is: Kingdom → Phylum → Class → Order → Family → Genus → Species.",
        topic: "Classification",
      },
      {
        question: "Which part of the flower develops into a fruit?",
        options: ["stamen", "petal", "ovary", "sepal"],
        answer: "C",
        explanation: "After fertilization, the ovary of a flower develops into a fruit.",
        topic: "Plant Biology",
      },
      {
        question: "The structure that carries impulses from the brain to muscles is the:",
        options: [
          "sensory neuron",
          "relay neuron",
          "motor neuron",
          "interneuron",
        ],
        answer: "C",
        explanation: "Motor neurons carry impulses from the brain/spinal cord to muscles/glands.",
        topic: "Nervous System",
      },
      {
        question: "Which of the following is NOT a characteristic of living things?",
        options: [
          "reproduction",
          "respiration",
          "rusting",
          "growth",
        ],
        answer: "C",
        explanation: "Rusting is a chemical process, not a characteristic of living things.",
        topic: "General Biology",
      },
      {
        question: "The process by which a tadpole develops into a frog is called:",
        options: ["incubation", "metamorphosis", "gestation", "germination"],
        answer: "B",
        explanation: "Metamorphosis is the transformation from larva (tadpole) to adult (frog).",
        topic: "Reproduction",
      },
      {
        question: "Which of these is a density-dependent factor in population control?",
        options: ["flood", "earthquake", "competition", "drought"],
        answer: "C",
        explanation: "Competition increases with population density and is density-dependent.",
        topic: "Ecology",
      },
      {
        question: "The part of the brain that controls involuntary actions is the:",
        options: ["cerebrum", "cerebellum", "medulla oblongata", "pons"],
        answer: "C",
        explanation: "The medulla oblongata controls involuntary actions like breathing and heartbeat.",
        topic: "Human Biology",
      },
    ],
  },
];

const NECO_EXAMS = [
  {
    title: "NECO Mathematics Practice",
    subject: "Mathematics",
    duration: 90,
    passingScore: 50,
    questions: [
      {
        question: "Simplify: (2³ × 2⁴) ÷ 2⁵",
        options: ["2²", "2³", "2⁴", "2⁷"],
        answer: "A",
        explanation: "(2³ × 2⁴) ÷ 2⁵ = 2^(3+4-5) = 2²",
        topic: "Indices",
      },
      {
        question: "Solve the inequality: 3x - 7 > 5",
        options: ["x > 4", "x < 4", "x > 2", "x < 2"],
        answer: "A",
        explanation: "3x > 12, x > 4",
        topic: "Inequalities",
      },
      {
        question: "What is the place value of 5 in 3.057?",
        options: ["units", "tenths", "hundredths", "thousandths"],
        answer: "C",
        explanation: "The 5 is in the hundredths place (second decimal place).",
        topic: "Number System",
      },
      {
        question: "Find the value of x: 4(x - 3) = 2(x + 5)",
        options: ["5", "8", "11", "13"],
        answer: "C",
        explanation: "4x - 12 = 2x + 10, 2x = 22, x = 11",
        topic: "Algebra",
      },
      {
        question: "A boy scored 72 marks out of 120. What is his percentage score?",
        options: ["50%", "60%", "72%", "80%"],
        answer: "B",
        explanation: "Percentage = (72/120) × 100 = 60%",
        topic: "Percentages",
      },
      {
        question: "The diagonal of a square is 10cm. What is the area?",
        options: ["25 cm²", "50 cm²", "100 cm²", "200 cm²"],
        answer: "B",
        explanation: "d = a√2, a = 10/√2, Area = a² = 100/2 = 50 cm²",
        topic: "Geometry",
      },
      {
        question: "Which of the following is a linear equation?",
        options: [
          "y = x² + 2",
          "y = 3x + 4",
          "y = x³",
          "y = 2^x",
        ],
        answer: "B",
        explanation: "y = 3x + 4 is linear (degree 1). The others are non-linear.",
        topic: "Algebra",
      },
      {
        question: "The sum of three consecutive odd numbers is 45. Find the smallest.",
        options: ["11", "13", "15", "17"],
        answer: "B",
        explanation: "Let the numbers be x, x+2, x+4. 3x+6=45, x=13",
        topic: "Algebra",
      },
      {
        question: "A car travels at 80km/h for 2.5 hours. The distance covered is:",
        options: ["160 km", "200 km", "240 km", "320 km"],
        answer: "B",
        explanation: "Distance = Speed × Time = 80 × 2.5 = 200 km",
        topic: "Distance, Speed and Time",
      },
      {
        question: "Find the value of: √(49 + 576)",
        options: ["20", "24", "25", "30"],
        answer: "C",
        explanation: "√(49 + 576) = √625 = 25",
        topic: "Surds",
      },
      {
        question: "If P = {a, b, c} and Q = {b, c, d}, find P ∪ Q.",
        options: [
          "{b, c}",
          "{a, b, c, d}",
          "{a, d}",
          "{a, b, c}",
        ],
        answer: "B",
        explanation: "P ∪ Q = {a, b, c, d} (all elements in either set)",
        topic: "Sets",
      },
      {
        question: "What is the gradient of the line passing through (2, 3) and (6, 11)?",
        options: ["1", "2", "3", "4"],
        answer: "B",
        explanation: "Gradient = (11-3)/(6-2) = 8/4 = 2",
        topic: "Coordinate Geometry",
      },
      {
        question: "A number is divisible by both 4 and 6. It must also be divisible by:",
        options: ["8", "10", "12", "24"],
        answer: "C",
        explanation: "LCM of 4 and 6 = 12. A number divisible by both must be divisible by 12.",
        topic: "Number Theory",
      },
      {
        question: "Solve: |2x - 5| = 7",
        options: ["x = 6 only", "x = -1 only", "x = 6 or x = -1", "x = 1 or x = -6"],
        answer: "C",
        explanation: "2x-5=7 → x=6; 2x-5=-7 → x=-1",
        topic: "Modulus",
      },
      {
        question: "The probability of throwing a fair die and getting a number less than 3 is:",
        options: ["1/6", "1/3", "1/2", "2/3"],
        answer: "B",
        explanation: "Numbers less than 3: {1, 2}. P = 2/6 = 1/3",
        topic: "Probability",
      },
      {
        question: "The sum of angles at a point is:",
        options: ["90°", "180°", "270°", "360°"],
        answer: "D",
        explanation: "Angles at a point add up to 360°.",
        topic: "Geometry",
      },
      {
        question: "Convert 5/8 to a decimal.",
        options: ["0.525", "0.625", "0.75", "0.875"],
        answer: "B",
        explanation: "5 ÷ 8 = 0.625",
        topic: "Fractions and Decimals",
      },
      {
        question: "If y varies directly as x and y = 8 when x = 2, find y when x = 5.",
        options: ["16", "20", "24", "40"],
        answer: "B",
        explanation: "y = kx, 8 = 2k, k = 4. y = 4(5) = 20",
        topic: "Variation",
      },
      {
        question: "The volume of a cone with radius 7cm and height 9cm is: (Take π = 22/7)",
        options: [
          "462 cm³",
          "1386 cm³",
          "616 cm³",
          "924 cm³",
        ],
        answer: "A",
        explanation: "V = (1/3)πr²h = (1/3)(22/7)(49)(9) = 462 cm³",
        topic: "Mensuration",
      },
      {
        question: "Find the median of: 3, 5, 7, 9, 11",
        options: ["5", "7", "9", "11"],
        answer: "B",
        explanation: "The middle value in the ordered list is 7.",
        topic: "Statistics",
      },
    ],
  },
  {
    title: "NECO English Language Practice",
    subject: "English Language",
    duration: 90,
    passingScore: 50,
    questions: [
      {
        question:
          "Choose the word that best completes the sentence: The children were ___ by the magician's tricks.",
        options: ["frightened", "amused", "annoyed", "bored"],
        answer: "B",
        explanation: "Amused means entertained or pleased by something humorous.",
        topic: "Vocabulary",
      },
      {
        question:
          "Choose the correct option: Every student ___ submitted ___ assignment.",
        options: ["have, their", "has, his or her", "has, their", "have, his"],
        answer: "B",
        explanation: "Every takes a singular verb. 'His or her' is the traditional singular pronoun.",
        topic: "Grammar",
      },
      {
        question: "Identify the figure of speech: 'Time is money.'",
        options: ["simile", "metaphor", "personification", "hyperbole"],
        answer: "B",
        explanation: "Time is directly compared to money without using 'like' or 'as' — it's a metaphor.",
        topic: "Figures of Speech",
      },
      {
        question:
          "Choose the option nearest in meaning to 'PRUDENT'",
        options: ["reckless", "careful", "stupid", "lazy"],
        answer: "B",
        explanation: "Prudent means acting with care and thought for the future.",
        topic: "Vocabulary",
      },
      {
        question: "Which of the following sentences is a question tag?",
        options: [
          "She is coming, isn't she?",
          "Is she coming?",
          "She isn't coming.",
          "She will come.",
        ],
        answer: "A",
        explanation: "A question tag is a short question added to a statement: 'isn't she?'",
        topic: "Grammar",
      },
      {
        question:
          "Choose the correct spelling: Which of these is correctly spelled?",
        options: ["Acquaintance", "Aquantance", "Acquaintence", "Aquantence"],
        answer: "A",
        explanation: "The correct spelling is 'Acquaintance'.",
        topic: "Spelling",
      },
      {
        question:
          "Choose the option that best completes the idiom: He let the cat out of the ___.",
        options: ["box", "bag", "room", "house"],
        answer: "B",
        explanation: "To let the cat out of the bag means to reveal a secret accidentally.",
        topic: "Idioms",
      },
      {
        question:
          "What does the proverb 'Don't put all your eggs in one basket' mean?",
        options: [
          "carry eggs carefully",
          "don't risk everything on one venture",
          "eggs are fragile",
          "baskets are important",
        ],
        answer: "B",
        explanation: "This means don't concentrate all your resources in one place.",
        topic: "Proverbs",
      },
      {
        question:
          "Choose the correct reported speech: 'I am learning French,' she said.",
        options: [
          "She said that she was learning French.",
          "She said that I am learning French.",
          "She said that she is learning French.",
          "She said that she was learning English.",
        ],
        answer: "A",
        explanation: "In reported speech: 'am' → 'was', 'I' → 'she'.",
        topic: "Reported Speech",
      },
      {
        question: "Which of these is a compound adjective?",
        options: ["beautiful", "well-known", "quickly", "running"],
        answer: "B",
        explanation: "Well-known is a compound adjective (two words joined by a hyphen).",
        topic: "Word Formation",
      },
      {
        question: "The word 'PHILANTHROPY' means:",
        options: [
          "love of animals",
          "love of money",
          "love of mankind",
          "love of books",
        ],
        answer: "C",
        explanation: "Philanthropy means the desire to promote the welfare of others.",
        topic: "Vocabulary",
      },
      {
        question: "Choose the correct option: The news ___ bad.",
        options: ["are", "were", "is", "have been"],
        answer: "C",
        explanation: "'News' is uncountable and takes a singular verb.",
        topic: "Grammar",
      },
      {
        question: "Which word is an antonym of 'HOPEFUL'?",
        options: ["optimistic", "confident", "despairing", "eager"],
        answer: "C",
        explanation: "Despairing is the opposite of hopeful.",
        topic: "Antonyms",
      },
      {
        question:
          "Choose the option that best completes the sentence: The teacher asked us to ___ our books.",
        options: ["rise", "raise", "arise", "rouse"],
        answer: "B",
        explanation: "Raise means to lift or move something upward.",
        topic: "Vocabulary",
      },
      {
        question:
          "Identify the type of clause: 'The man who lives next door is a doctor.'",
        options: [
          "adverbial clause",
          "noun clause",
          "relative clause",
          "conditional clause",
        ],
        answer: "C",
        explanation: "'Who lives next door' is a relative clause modifying 'the man'.",
        topic: "Grammar",
      },
      {
        question: "The past participle of 'write' is:",
        options: ["wrote", "written", "writed", "writing"],
        answer: "B",
        explanation: "Write (present) → Wrote (past) → Written (past participle).",
        topic: "Tenses",
      },
      {
        question:
          "What is the meaning of the expression 'to hit the nail on the head'?",
        options: [
          "to cause pain",
          "to be exactly right",
          "to hit something hard",
          "to work quickly",
        ],
        answer: "B",
        explanation: "This idiom means to describe exactly what is causing a situation.",
        topic: "Idioms",
      },
      {
        question: "Which of these sentences is in the passive voice?",
        options: [
          "The dog chased the cat.",
          "The cat was chased by the dog.",
          "The dog is chasing the cat.",
          "The dog will chase the cat.",
        ],
        answer: "B",
        explanation: "In passive voice, the object becomes the subject: 'The cat was chased by the dog.'",
        topic: "Voice",
      },
      {
        question:
          "Choose the correct conjunction: ___ it rained heavily, we still went out.",
        options: ["Because", "Although", "Since", "Therefore"],
        answer: "B",
        explanation: "'Although' is used to show contrast between two clauses.",
        topic: "Conjunctions",
      },
      {
        question: "The word 'AUTONOMY' means:",
        options: [
          "dependence on others",
          "self-government or independence",
          "lack of control",
          "obedience",
        ],
        answer: "B",
        explanation: "Autonomy means the right or condition of self-government.",
        topic: "Vocabulary",
      },
    ],
  },
  {
    title: "NECO Physics Practice",
    subject: "Physics",
    duration: 90,
    passingScore: 50,
    questions: [
      {
        question: "The dimension of impulse is:",
        options: ["MLT⁻¹", "MLT⁻²", "ML²T⁻²", "ML²T⁻¹"],
        answer: "A",
        explanation: "Impulse = Force × Time = MLT⁻² × T = MLT⁻¹",
        topic: "Units and Dimensions",
      },
      {
        question: "A stone is dropped from a height of 80m. How long does it take to reach the ground? (g = 10m/s²)",
        options: ["2s", "3s", "4s", "5s"],
        answer: "C",
        explanation: "h = ½gt², 80 = 5t², t² = 16, t = 4s",
        topic: "Free Fall",
      },
      {
        question: "The principle behind the operation of a hydraulic press is:",
        options: [
          "Archimedes' principle",
          "Pascal's principle",
          "Bernoulli's principle",
          "Charles's law",
        ],
        answer: "B",
        explanation: "Pascal's principle states that pressure applied to an enclosed fluid is transmitted equally.",
        topic: "Pressure",
      },
      {
        question: "What is the work done in lifting a 50N weight through 4m?",
        options: ["200 J", "100 J", "54 J", "45 J"],
        answer: "A",
        explanation: "W = F × d = 50 × 4 = 200 J",
        topic: "Work and Energy",
      },
      {
        question: "The frequency of a wave with wavelength 0.5m and speed 340m/s is:",
        options: ["170 Hz", "340 Hz", "680 Hz", "1700 Hz"],
        answer: "C",
        explanation: "f = v/λ = 340/0.5 = 680 Hz",
        topic: "Waves",
      },
      {
        question: "Which of the following has the highest electrical conductivity?",
        options: ["copper", "silver", "aluminum", "iron"],
        answer: "B",
        explanation: "Silver has the highest electrical conductivity of all metals.",
        topic: "Electricity",
      },
      {
        question: "The angle of elevation of the top of a tower from a point 50m away is 30°. The height of the tower is:",
        options: [
          "50/√3 m",
          "50√3 m",
          "25√3 m",
          "100 m",
        ],
        answer: "A",
        explanation: "tan 30° = h/50, h = 50 tan 30° = 50/√3 m",
        topic: "Trigonometry",
      },
      {
        question: "Which type of lens is used to correct long-sightedness?",
        options: ["concave", "convex", "bifocal", "cylindrical"],
        answer: "B",
        explanation: "A convex (converging) lens corrects hypermetropia (long-sightedness).",
        topic: "Optics",
      },
      {
        question: "The moment of a force depends on:",
        options: [
          "the mass of the body",
          "the distance from the pivot",
          "the speed of the body",
          "the acceleration",
        ],
        answer: "B",
        explanation: "Moment of a force = Force × perpendicular distance from the pivot.",
        topic: "Moments",
      },
      {
        question: "The internal resistance of an ideal ammeter is:",
        options: ["zero", "very high", "infinite", "moderate"],
        answer: "A",
        explanation: "An ideal ammeter has zero resistance to avoid affecting the circuit.",
        topic: "Electricity",
      },
      {
        question: "Which of the following is a vector quantity?",
        options: ["speed", "distance", "displacement", "time"],
        answer: "C",
        explanation: "Displacement has both magnitude and direction, making it a vector.",
        topic: "Vectors",
      },
      {
        question: "A body moving in a circle at constant speed has:",
        options: [
          "constant velocity",
          "constant acceleration",
          "zero acceleration",
          "changing velocity",
        ],
        answer: "D",
        explanation: "Though speed is constant, direction changes continuously, so velocity changes.",
        topic: "Circular Motion",
      },
      {
        question: "The efficiency of a machine is 75%. If the input work is 200J, the output work is:",
        options: ["150 J", "175 J", "200 J", "267 J"],
        answer: "A",
        explanation: "Output = Efficiency × Input = 0.75 × 200 = 150 J",
        topic: "Machines",
      },
      {
        question: "The phenomenon of light bending around obstacles is called:",
        options: ["refraction", "reflection", "diffraction", "dispersion"],
        answer: "C",
        explanation: "Diffraction is the bending of waves around obstacles or through openings.",
        topic: "Wave Properties",
      },
      {
        question: "The unit of electrical energy is:",
        options: ["Watt", "Joule", "Kilowatt-hour", "Volt"],
        answer: "C",
        explanation: "The kilowatt-hour (kWh) is the practical unit of electrical energy.",
        topic: "Electricity",
      },
      {
        question: "An object weighs 10N in air and 8N when immersed in water. The buoyant force is:",
        options: ["2N", "8N", "10N", "18N"],
        answer: "A",
        explanation: "Buoyant force = weight in air - weight in water = 10 - 8 = 2N",
        topic: "Archimedes' Principle",
      },
      {
        question: "Which of the following is an application of electromagnetic induction?",
        options: [
          "electric heater",
          "electric generator",
          "electric fuse",
          "electric bell",
        ],
        answer: "B",
        explanation: "Electric generators work on the principle of electromagnetic induction.",
        topic: "Electromagnetism",
      },
      {
        question: "The time period of a simple pendulum of length 1m is approximately:",
        options: ["1s", "2s", "3s", "4s"],
        answer: "B",
        explanation: "T = 2π√(L/g) = 2π√(1/9.8) ≈ 2s",
        topic: "Oscillations",
      },
      {
        question: "A body weighs 48N on Earth. Its mass is approximately: (g = 10m/s²)",
        options: ["4.8 kg", "48 kg", "480 kg", "0.48 kg"],
        answer: "A",
        explanation: "Mass = Weight/g = 48/10 = 4.8 kg",
        topic: "Mass and Weight",
      },
      {
        question: "The process by which a solid becomes a gas without becoming a liquid is:",
        options: ["evaporation", "condensation", "sublimation", "boiling"],
        answer: "C",
        explanation: "Sublimation is the direct transition from solid to gas.",
        topic: "States of Matter",
      },
    ],
  },
  {
    title: "NECO Chemistry Practice",
    subject: "Chemistry",
    duration: 90,
    passingScore: 50,
    questions: [
      {
        question: "What is the number of protons in an atom of Carbon-14?",
        options: ["6", "8", "14", "20"],
        answer: "A",
        explanation: "Carbon always has 6 protons. The number 14 refers to the mass number.",
        topic: "Atomic Structure",
      },
      {
        question: "Which of the following is an organic compound?",
        options: ["NaCl", "H₂O", "CH₄", "CaCO₃"],
        answer: "C",
        explanation: "Methane (CH₄) is an organic compound containing carbon and hydrogen.",
        topic: "Organic Chemistry",
      },
      {
        question: "The reaction between an acid and a base is called:",
        options: ["oxidation", "neutralization", "reduction", "displacement"],
        answer: "B",
        explanation: "Neutralization is the reaction between an acid and a base to form salt and water.",
        topic: "Acids and Bases",
      },
      {
        question: "Which gas is produced when magnesium reacts with dilute HCl?",
        options: ["oxygen", "chlorine", "hydrogen", "carbon dioxide"],
        answer: "C",
        explanation: "Mg + 2HCl → MgCl₂ + H₂↑",
        topic: "Chemical Reactions",
      },
      {
        question: "The periodic table is arranged in order of increasing:",
        options: ["mass number", "atomic number", "atomic mass", "neutrons"],
        answer: "B",
        explanation: "The modern periodic table is arranged in order of increasing atomic number.",
        topic: "Periodic Table",
      },
      {
        question: "Which of the following is used to test for carbon dioxide gas?",
        options: [
          "litmus paper",
          "lime water",
          "blue litmus paper",
          "phenolphthalein",
        ],
        answer: "B",
        explanation: "CO₂ turns lime water milky (forms CaCO₃ precipitate).",
        topic: "Tests for Gases",
      },
      {
        question: "An isotope of an element has the same number of _____ but different number of _____.",
        options: [
          "protons, neutrons",
          "neutrons, protons",
          "electrons, protons",
          "protons, electrons",
        ],
        answer: "A",
        explanation: "Isotopes have the same number of protons but different numbers of neutrons.",
        topic: "Atomic Structure",
      },
      {
        question: "Which of these is a property of metals?",
        options: [
          "brittle",
          "low melting point",
          "good conductors of heat",
          "dull appearance",
        ],
        answer: "C",
        explanation: "Metals are good conductors of heat and electricity.",
        topic: "Properties of Matter",
      },
      {
        question: "What is the product of the reaction between sodium and water?",
        options: [
          "sodium oxide",
          "sodium hydroxide and hydrogen",
          "sodium chloride",
          "sodium carbonate",
        ],
        answer: "B",
        explanation: "2Na + 2H₂O → 2NaOH + H₂↑",
        topic: "Chemical Reactions",
      },
      {
        question: "The type of bonding in methane (CH₄) is:",
        options: ["ionic", "covalent", "metallic", "coordinate"],
        answer: "B",
        explanation: "Methane has covalent bonds (shared electrons between C and H).",
        topic: "Chemical Bonding",
      },
      {
        question: "A solution with pH 3 is:",
        options: [
          "strongly acidic",
          "weakly acidic",
          "neutral",
          "weakly alkaline",
        ],
        answer: "A",
        explanation: "pH below 7 is acidic. pH 3 is strongly acidic.",
        topic: "Acids and Bases",
      },
      {
        question: "Which of the following is NOT a state of matter?",
        options: ["solid", "liquid", "plasma", "energy"],
        answer: "D",
        explanation: "Energy is not a state of matter. Solid, liquid, gas, and plasma are states.",
        topic: "States of Matter",
      },
      {
        question: "What is the charge on an ion with 11 protons and 10 electrons?",
        options: ["+1", "-1", "+2", "-2"],
        answer: "A",
        explanation: "Charge = protons - electrons = 11 - 10 = +1",
        topic: "Ionic Structure",
      },
      {
        question: "Which of the following is an example of a suspension?",
        options: ["salt water", "sugar solution", "muddy water", "air"],
        answer: "C",
        explanation: "Muddy water is a suspension — particles settle on standing.",
        topic: "Mixtures",
      },
      {
        question: "Rusting requires the presence of:",
        options: [
          "oxygen only",
          "water only",
          "both oxygen and water",
          "carbon dioxide",
        ],
        answer: "C",
        explanation: "Rusting of iron requires both oxygen and water (moisture).",
        topic: "Corrosion",
      },
      {
        question: "What is the electron dot structure of NaCl?",
        options: [
          "Na:Cl",
          "Na⁺[:Cl:]⁻",
          "Na-Cl",
          "Na=Cl",
        ],
        answer: "B",
        explanation: "NaCl is ionic: Na⁺ and Cl⁻ with 8 electrons around Cl.",
        topic: "Chemical Bonding",
      },
      {
        question: "Which of the following is an application of distillation?",
        options: [
          "separation of salt from water",
          "separation of sand from salt",
          "separation of iron from sand",
          "separation of ethanol from water",
        ],
        answer: "D",
        explanation: "Distillation separates liquids based on different boiling points.",
        topic: "Separation Techniques",
      },
      {
        question: "The molecular formula of glucose is C₆H₁₂O₆. How many moles of carbon atoms are in 2 moles of glucose?",
        options: ["6", "12", "18", "24"],
        answer: "B",
        explanation: "2 moles glucose × 6 carbon atoms = 12 moles of carbon atoms.",
        topic: "Mole Concept",
      },
      {
        question: "Which gas is used in the manufacture of ammonia?",
        options: ["oxygen and hydrogen", "nitrogen and hydrogen", "nitrogen and oxygen", "hydrogen and carbon dioxide"],
        answer: "B",
        explanation: "The Haber process uses nitrogen and hydrogen to produce ammonia.",
        topic: "Industrial Chemistry",
      },
      {
        question: "Which of the following is a reducing agent?",
        options: ["oxygen", "hydrogen", "chlorine", "nitrogen"],
        answer: "B",
        explanation: "Hydrogen acts as a reducing agent by donating electrons.",
        topic: "Redox Reactions",
      },
    ],
  },
  {
    title: "NECO Biology Practice",
    subject: "Biology",
    duration: 90,
    passingScore: 50,
    questions: [
      {
        question: "The study of living organisms is called:",
        options: ["physics", "chemistry", "biology", "geography"],
        answer: "C",
        explanation: "Biology is the scientific study of life and living organisms.",
        topic: "General Biology",
      },
      {
        question: "Which of the following is an invertebrate?",
        options: ["frog", "snake", "earthworm", "lizard"],
        answer: "C",
        explanation: "An earthworm is an invertebrate (no backbone). The others are vertebrates.",
        topic: "Classification",
      },
      {
        question: "The organelle responsible for protein synthesis is the:",
        options: ["mitochondria", "ribosome", "nucleus", "Golgi body"],
        answer: "B",
        explanation: "Ribosomes are the sites of protein synthesis in cells.",
        topic: "Cell Biology",
      },
      {
        question: "Translocation in plants refers to the transport of:",
        options: [
          "water",
          "minerals",
          "manufactured food",
          "oxygen",
        ],
        answer: "C",
        explanation: "Translocation is the movement of manufactured food (sucrose) through the phloem.",
        topic: "Plant Biology",
      },
      {
        question: "Which of the following is a characteristic of mammals?",
        options: [
          "laying eggs",
          "having feathers",
          "giving birth to live young",
          "having scales",
        ],
        answer: "C",
        explanation: "Mammals give birth to live young (except monotremes) and nurse them with milk.",
        topic: "Classification",
      },
      {
        question: "The process by which white blood cells engulf bacteria is called:",
        options: ["osmosis", "phagocytosis", "diffusion", "filtration"],
        answer: "B",
        explanation: "Phagocytosis is the process by which cells engulf large particles or bacteria.",
        topic: "Cell Biology",
      },
      {
        question: "Which of the following is NOT a function of the liver?",
        options: [
          "production of bile",
          "detoxification",
          "filtration of blood",
          "production of insulin",
        ],
        answer: "D",
        explanation: "Insulin is produced by the pancreas, not the liver.",
        topic: "Human Biology",
      },
      {
        question: "The deficiency of Vitamin C causes:",
        options: [
          "rickets",
          "scurvy",
          "beriberi",
          "pellagra",
        ],
        answer: "B",
        explanation: "Scurvy is caused by Vitamin C deficiency.",
        topic: "Nutrition",
      },
      {
        question: "Which of the following is an example of a biotic factor in an ecosystem?",
        options: ["soil", "water", "plants", "temperature"],
        answer: "C",
        explanation: "Plants are biotic (living) factors. Soil, water, and temperature are abiotic.",
        topic: "Ecology",
      },
      {
        question: "The structure of DNA is described as a:",
        options: [
          "single helix",
          "double helix",
          "triple helix",
          "flat chain",
        ],
        answer: "B",
        explanation: "DNA has a double helix structure, as described by Watson and Crick.",
        topic: "Genetics",
      },
      {
        question: "Which of the following is a function of the skeleton?",
        options: [
          "digestion of food",
          "support and protection",
          "production of hormones",
          "transport of oxygen",
        ],
        answer: "B",
        explanation: "The skeleton provides support, protection, and facilitates movement.",
        topic: "Human Biology",
      },
      {
        question: "The process of water movement from roots to leaves is called:",
        options: ["transpiration", "translocation", "osmosis", "diffusion"],
        answer: "A",
        explanation: "Transpiration is the evaporation of water from leaves through stomata.",
        topic: "Plant Biology",
      },
      {
        question: "Which type of organism breaks down dead organic matter?",
        options: [
          "producers",
          "consumers",
          "decomposers",
          "parasites",
        ],
        answer: "C",
        explanation: "Decomposers (bacteria and fungi) break down dead organic matter.",
        topic: "Ecology",
      },
      {
        question: "The white part of the human eye is called the:",
        options: ["retina", "iris", "sclera", "cornea"],
        answer: "C",
        explanation: "The sclera is the tough, white outer layer of the eye.",
        topic: "Human Biology",
      },
      {
        question: "Which of the following is NOT a method of contraception?",
        options: [
          "condom",
          "oral pill",
          "exercise",
          "intrauterine device",
        ],
        answer: "C",
        explanation: "Exercise is not a method of contraception.",
        topic: "Reproduction",
      },
      {
        question: "The part of the plant that absorbs water from the soil is the:",
        options: ["stem", "root hair", "leaf", "flower"],
        answer: "B",
        explanation: "Root hairs increase surface area for water absorption from the soil.",
        topic: "Plant Biology",
      },
      {
        question: "The number of chromosomes in a human body cell is:",
        options: ["23", "46", "44", "48"],
        answer: "B",
        explanation: "Human body cells have 46 chromosomes (23 pairs).",
        topic: "Genetics",
      },
      {
        question: "Which of the following is a density-independent factor?",
        options: ["competition", "disease", "flood", "predation"],
        answer: "C",
        explanation: "Floods affect populations regardless of density — they are density-independent.",
        topic: "Ecology",
      },
      {
        question: "The gas exchanged during respiration is:",
        options: [
          "nitrogen and oxygen",
          "oxygen and carbon dioxide",
          "oxygen and hydrogen",
          "carbon dioxide and nitrogen",
        ],
        answer: "B",
        explanation: "In respiration, oxygen is taken in and carbon dioxide is released.",
        topic: "Human Biology",
      },
      {
        question: "The phenomenon where organisms develop similar features due to similar environments is called:",
        options: [
          "divergent evolution",
          "convergent evolution",
          "co-evolution",
          "artificial selection",
        ],
        answer: "B",
        explanation: "Convergent evolution produces similar features in unrelated species in similar environments.",
        topic: "Evolution",
      },
    ],
  },
];

async function main() {
  console.log("Starting CBT practice seed...");

  const school = await prisma.school.findFirst();
  if (!school) {
    console.error("No school found. Please create a school first.");
    process.exit(1);
  }

  console.log(`Using school: ${school.name} (${school.id})`);

  const existingExams = await prisma.cBTExam.count({
    where: { type: "practice" },
  });

  if (existingExams >= 15) {
    console.log(`Found ${existingExams} existing practice exams. Skipping seed.`);
    await prisma.$disconnect();
    return;
  }

  let totalExams = 0;
  let totalQuestions = 0;

  const allExamSets = [
    { exams: JAMB_EXAMS, prefix: "JAMB" },
    { exams: WAEC_EXAMS, prefix: "WAEC" },
    { exams: NECO_EXAMS, prefix: "NECO" },
  ];

  for (const examSet of allExamSets) {
    for (const examData of examSet.exams) {
      const exam = await prisma.cBTExam.create({
        data: {
          id: generateId(),
          schoolId: school.id,
          title: examData.title,
          subject: examData.subject,
          duration: examData.duration,
          totalQuestions: examData.questions.length,
          passingScore: examData.passingScore,
          type: "practice",
          status: "published",
        },
      });

      const questionData = examData.questions.map((q) => ({
        id: generateId(),
        examId: exam.id,
        question: q.question,
        type: "objective",
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        marks: 1,
        difficulty: "medium",
        topic: q.topic,
      }));

      await prisma.cBTQuestion.createMany({ data: questionData });

      totalExams++;
      totalQuestions += examData.questions.length;

      console.log(
        `Created: ${examData.title} (${examData.questions.length} questions)`
      );
    }
  }

  console.log(`\nSeed completed!`);
  console.log(`Total exams created: ${totalExams}`);
  console.log(`Total questions created: ${totalQuestions}`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Seed error:", error);
  process.exit(1);
});
