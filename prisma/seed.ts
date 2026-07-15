import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
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
  console.log("🌱 Seeding database...\n");

  // Create School
  const school = await prisma.school.upsert({
    where: { slug: "ffb-main" },
    update: {},
    create: {
      name: "FFB Group of Schools",
      slug: "ffb-main",
      email: "info@ffb.edu.ng",
      phone: "+234 801 234 5678",
      address: "123 Education Avenue, GRA",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      motto: "Knowledge, Excellence, Integrity",
      type: "secondary",
      status: "active",
    },
  });
  console.log("✅ School created:", school.name);

  // Create Roles
  const rolesData = [
    { name: "SUPER_ADMIN", description: "Super Administrator with full access", level: 100, isSystem: true },
    { name: "SCHOOL_OWNER", description: "School Owner", level: 90, isSystem: true },
    { name: "ADMINISTRATOR", description: "School Administrator", level: 80, isSystem: false },
    { name: "PRINCIPAL", description: "School Principal", level: 75, isSystem: false },
    { name: "VICE_PRINCIPAL", description: "Vice Principal", level: 70, isSystem: false },
    { name: "ACADEMIC_ADMIN", description: "Academic Administrator", level: 65, isSystem: false },
    { name: "TEACHER", description: "Subject Teacher", level: 50, isSystem: false },
    { name: "CLASS_TEACHER", description: "Class Teacher", level: 55, isSystem: false },
    { name: "EXAM_OFFICER", description: "Examination Officer", level: 55, isSystem: false },
    { name: "ADMISSIONS_OFFICER", description: "Admissions Officer", level: 50, isSystem: false },
    { name: "LIBRARIAN", description: "School Librarian", level: 45, isSystem: false },
    { name: "BURSAR", description: "School Bursar", level: 55, isSystem: false },
    { name: "ACCOUNTANT", description: "Accountant", level: 50, isSystem: false },
    { name: "HOSTEL_MASTER", description: "Hostel Master", level: 45, isSystem: false },
    { name: "CLINIC_STAFF", description: "Clinic Staff", level: 40, isSystem: false },
    { name: "RECEPTIONIST", description: "Receptionist", level: 30, isSystem: false },
    { name: "SECURITY", description: "Security Personnel", level: 25, isSystem: false },
    { name: "STUDENT", description: "Student", level: 10, isSystem: false },
    { name: "PARENT", description: "Parent/Guardian", level: 15, isSystem: false },
    { name: "ALUMNI", description: "Alumni Member", level: 5, isSystem: false },
  ];

  const roles: Record<string, string> = {};
  for (const role of rolesData) {
    const created = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    roles[role.name] = created.id;
  }
  console.log("✅ Roles created:", Object.keys(roles).length);

  // Create Permissions
  const modules = ["students", "teachers", "classes", "attendance", "finance", "library", "hostel", "transport", "clinic", "inventory", "exams", "results", "admissions", "alumni", "announcements", "settings"];
  const actions = ["create", "read", "update", "delete", "export"];

  const permissions: string[] = [];
  for (const mod of modules) {
    for (const action of actions) {
      const perm = await prisma.permission.upsert({
        where: { name: `${mod}.${action}` },
        update: {},
        create: {
          name: `${mod}.${action}`,
          module: mod,
          action: action,
          description: `${action} ${mod}`,
        },
      });
      permissions.push(perm.id);
    }
  }
  console.log("✅ Permissions created:", permissions.length);

  // Assign all permissions to SUPER_ADMIN
  const superAdminRole = roles["SUPER_ADMIN"];
  for (const permId of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole, permissionId: permId } },
      update: {},
      create: { roleId: superAdminRole, permissionId: permId },
    });
  }
  console.log("✅ SUPER_ADMIN permissions assigned");

  // Create Admin User
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@ffb.edu.ng" },
    update: {},
    create: {
      email: "admin@ffb.edu.ng",
      name: "System Administrator",
      password: hashedPassword,
      phone: "+234 801 234 5678",
      isActive: true,
      schoolId: school.id,
    },
  });

  // Assign SUPER_ADMIN role to admin user
  await prisma.userRole.upsert({
    where: { userId_roleId_schoolId: { userId: adminUser.id, roleId: superAdminRole, schoolId: school.id } },
    update: {},
    create: { userId: adminUser.id, roleId: superAdminRole, schoolId: school.id },
  });
  console.log("✅ Admin user created:", adminUser.email);

  // Create Academic Year
  const academicYear = await prisma.academicYear.upsert({
    where: { id: "current-year" },
    update: {},
    create: {
      id: "current-year",
      schoolId: school.id,
      name: "2024/2025",
      startDate: new Date("2024-09-09"),
      endDate: new Date("2025-07-18"),
      isCurrent: true,
    },
  });

  // Create Terms
  const termData = [
    { name: "First Term", start: new Date("2024-09-09"), end: new Date("2024-12-13"), isCurrent: true },
    { name: "Second Term", start: new Date("2025-01-06"), end: new Date("2025-03-28"), isCurrent: false },
    { name: "Third Term", start: new Date("2025-04-28"), end: new Date("2025-07-18"), isCurrent: false },
  ];
  const termRecords: Record<string, string> = {};
  for (const td of termData) {
    const term = await prisma.term.upsert({
      where: { academicYearId_name: { academicYearId: academicYear.id, name: td.name } },
      update: {},
      create: {
        schoolId: school.id,
        academicYearId: academicYear.id,
        name: td.name,
        startDate: td.start,
        endDate: td.end,
        isCurrent: td.isCurrent,
      },
    });
    termRecords[td.name] = term.id;
  }
  console.log("✅ Terms created");

  // Create Classes
  const classNames = [
    { name: "JSS1", displayName: "Junior Secondary 1", level: 1 },
    { name: "JSS2", displayName: "Junior Secondary 2", level: 2 },
    { name: "JSS3", displayName: "Junior Secondary 3", level: 3 },
    { name: "SS1", displayName: "Senior Secondary 1", level: 4 },
    { name: "SS2", displayName: "Senior Secondary 2", level: 5 },
    { name: "SS3", displayName: "Senior Secondary 3", level: 6 },
  ];

  const classRecords: Record<string, string> = {};
  for (const cls of classNames) {
    const created = await prisma.schoolClass.upsert({
      where: { schoolId_name_academicYearId: { schoolId: school.id, name: cls.name, academicYearId: academicYear.id } },
      update: {},
      create: {
        schoolId: school.id,
        academicYearId: academicYear.id,
        name: cls.name,
        displayName: cls.displayName,
        level: cls.level,
        capacity: 40,
      },
    });
    classRecords[cls.name] = created.id;
  }
  console.log("✅ Classes created");

  // Create Subjects
  const subjects = [
    { name: "Mathematics", code: "MTH" },
    { name: "English Language", code: "ENG" },
    { name: "Physics", code: "PHY" },
    { name: "Chemistry", code: "CHM" },
    { name: "Biology", code: "BIO" },
    { name: "Literature in English", code: "LIT" },
    { name: "Economics", code: "ECO" },
    { name: "Government", code: "GOV" },
    { name: "Computer Science", code: "CMP" },
    { name: "Civic Education", code: "CIV" },
    { name: "Agricultural Science", code: "AGR" },
    { name: "Christian Religious Studies", code: "CRS" },
  ];

  for (const sub of subjects) {
    await prisma.subject.upsert({
      where: { schoolId_code: { schoolId: school.id, code: sub.code } },
      update: {},
      create: {
        schoolId: school.id,
        name: sub.name,
        code: sub.code,
      },
    });
  }
  console.log("✅ Subjects created");

  // Create Demo Teacher
  const teacherPassword = await bcrypt.hash("teacher123", 12);
  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@ffb.edu.ng" },
    update: {},
    create: {
      email: "teacher@ffb.edu.ng",
      name: "Mrs. Adunni Olatunde",
      password: teacherPassword,
      phone: "+234 802 345 6789",
      isActive: true,
      schoolId: school.id,
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { employeeId: "TCH001" },
    update: {},
    create: {
      schoolId: school.id,
      userId: teacherUser.id,
      employeeId: "TCH001",
      firstName: "Adunni",
      lastName: "Olatunde",
      phone: "+234 802 345 6789",
      email: "teacher@ffb.edu.ng",
      qualification: "B.Ed Mathematics",
      specialization: "Mathematics",
      gender: "female",
    },
  });

  const teacherRole = roles["TEACHER"];
  await prisma.userRole.upsert({
    where: { userId_roleId_schoolId: { userId: teacherUser.id, roleId: teacherRole, schoolId: school.id } },
    update: {},
    create: { userId: teacherUser.id, roleId: teacherRole, schoolId: school.id },
  });
  console.log("✅ Demo teacher created:", teacher.employeeId);

  // Create Demo Students
  const studentPassword = await bcrypt.hash("student123", 12);
  const studentsData = [
    { first: "Adebayo", last: "Johnson", gender: "Male", class: "SS3" },
    { first: "Chioma", last: "Okafor", gender: "Female", class: "SS2" },
    { first: "Ibrahim", last: "Mohammed", gender: "Male", class: "JSS3" },
    { first: "Fatima", last: "Abdullahi", gender: "Female", class: "JSS2" },
    { first: "Emeka", last: "Nwankwo", gender: "Male", class: "SS1" },
    { first: "Aisha", last: "Bello", gender: "Female", class: "SS3" },
    { first: "Oluwaseun", last: "Akindele", gender: "Male", class: "SS2" },
    { first: "Ngozi", last: "Okoro", gender: "Female", class: "JSS1" },
    { first: "Tunde", last: "Bakare", gender: "Male", class: "JSS1" },
    { first: "Funmilayo", last: "Adeyemi", gender: "Female", class: "JSS3" },
  ];

  for (let i = 0; i < studentsData.length; i++) {
    const s = studentsData[i];
    const admNo = `FFB/2024/${(i + 1).toString().padStart(4, "0")}`;
    const studentUser = await prisma.user.upsert({
      where: { email: `${s.first.toLowerCase()}.${s.last.toLowerCase()}@student.ffb.edu.ng` },
      update: {},
      create: {
        email: `${s.first.toLowerCase()}.${s.last.toLowerCase()}@student.ffb.edu.ng`,
        name: `${s.first} ${s.last}`,
        password: studentPassword,
        isActive: true,
        schoolId: school.id,
      },
    });

    const student = await prisma.student.upsert({
      where: { admissionNumber: admNo },
      update: {},
      create: {
        admissionNumber: admNo,
        userId: studentUser.id,
        schoolId: school.id,
        classId: classRecords[s.class],
        firstName: s.first,
        lastName: s.last,
        gender: s.gender,
        dateOfBirth: new Date(2008 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        nationality: "Nigerian",
        stateOfOrigin: "Lagos",
        status: "active",
      },
    });

    const studentRole = roles["STUDENT"];
    await prisma.userRole.upsert({
      where: { userId_roleId_schoolId: { userId: studentUser.id, roleId: studentRole, schoolId: school.id } },
      update: {},
      create: { userId: studentUser.id, roleId: studentRole, schoolId: school.id },
    });
  }
  console.log("✅ Demo students created:", studentsData.length);

  // Create Grading Scale
  const gradingScales = [
    { grade: "A1", minScore: 75, maxScore: 100, remark: "Excellent", gpa: 4.0 },
    { grade: "B2", minScore: 70, maxScore: 74, remark: "Very Good", gpa: 3.5 },
    { grade: "B3", minScore: 65, maxScore: 69, remark: "Good", gpa: 3.0 },
    { grade: "C4", minScore: 60, maxScore: 64, remark: "Credit", gpa: 2.5 },
    { grade: "C5", minScore: 55, maxScore: 59, remark: "Credit", gpa: 2.0 },
    { grade: "C6", minScore: 50, maxScore: 54, remark: "Credit", gpa: 1.5 },
    { grade: "D7", minScore: 45, maxScore: 49, remark: "Pass", gpa: 1.0 },
    { grade: "E8", minScore: 40, maxScore: 44, remark: "Pass", gpa: 0.5 },
    { grade: "F9", minScore: 0, maxScore: 39, remark: "Fail", gpa: 0.0 },
  ];

  for (const gs of gradingScales) {
    await prisma.gradingScale.upsert({
      where: { schoolId_grade: { schoolId: school.id, grade: gs.grade } },
      update: {},
      create: { schoolId: school.id, name: "WAEC Grading", ...gs },
    });
  }
  console.log("✅ Grading scale created");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📧 Admin Login:");
  console.log("   Email: admin@ffb.edu.ng");
  console.log("   Password: admin123");
  console.log("\n📧 Teacher Login:");
  console.log("   Email: teacher@ffb.edu.ng");
  console.log("   Password: teacher123");
  console.log("\n📧 Student Login:");
  console.log("   Email: adebayo.johnson@student.ffb.edu.ng");
  console.log("   Password: student123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
