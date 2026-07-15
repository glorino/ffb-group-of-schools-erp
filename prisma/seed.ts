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

  // ═══════════════════════════════════════════════════════════
  // COMPREHENSIVE DEMO DATA
  // ═══════════════════════════════════════════════════════════

  // ── More Students (bringing total to 20) ──────────────────
  const moreStudentsData = [
    { first: "Olumide", last: "Adeyinka", gender: "Male", class: "SS3", state: "Oyo", blood: "A+", phone: "+234 803 456 7890" },
    { first: "Blessing", last: "Effiong", gender: "Female", class: "SS3", state: "Akwa Ibom", blood: "O+", phone: "+234 804 567 8901" },
    { first: "Yusuf", last: "Abubakar", gender: "Male", class: "SS2", state: "Kano", blood: "B+", phone: "+234 805 678 9012" },
    { first: "Chidinma", last: "Eze", gender: "Female", class: "SS2", state: "Enugu", blood: "AB+", phone: "+234 806 789 0123" },
    { first: "Temitope", last: "Ogundipe", gender: "Male", class: "JSS3", state: "Osun", blood: "A-", phone: "+234 807 890 1234" },
    { first: "Amina", last: "Ibrahim", gender: "Female", class: "JSS2", state: "Kaduna", blood: "O-", phone: "+234 808 901 2345" },
    { first: "Kunle", last: "Fashola", gender: "Male", class: "SS1", state: "Lagos", blood: "B-", phone: "+234 809 012 3456" },
    { first: "Nneka", last: "Obi", gender: "Female", class: "SS1", state: "Anambra", blood: "A+", phone: "+234 810 123 4567" },
    { first: "Femi", last: "Soyinka", gender: "Male", class: "JSS1", state: "Ogun", blood: "O+", phone: "+234 811 234 5678" },
    { first: "Halima", last: "Suleiman", gender: "Female", class: "JSS1", state: "Borno", blood: "AB-", phone: "+234 812 345 6789" },
  ];

  const allStudents: { id: string; firstName: string; lastName: string; class: string; gender: string }[] = [];

  // Store original 10 students
  for (let i = 0; i < studentsData.length; i++) {
    const s = studentsData[i];
    const admNo = `FFB/2024/${(i + 1).toString().padStart(4, "0")}`;
    const existingStudent = await prisma.student.findUnique({ where: { admissionNumber: admNo } });
    if (existingStudent) {
      allStudents.push({ id: existingStudent.id, firstName: s.first, lastName: s.last, class: s.class, gender: s.gender });
    }
  }

  for (let i = 0; i < moreStudentsData.length; i++) {
    const s = moreStudentsData[i];
    const admNo = `FFB/2024/${(studentsData.length + i + 1).toString().padStart(4, "0")}`;
    const email = `${s.first.toLowerCase()}.${s.last.toLowerCase()}@student.ffb.edu.ng`;

    const studentUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
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
        stateOfOrigin: s.state,
        bloodGroup: s.blood,
        phone: s.phone,
        photo: `https://ui-avatars.com/api/?name=${s.first}+${s.last}&background=random&size=200`,
        status: "active",
      },
    });

    const studentRole = roles["STUDENT"];
    await prisma.userRole.upsert({
      where: { userId_roleId_schoolId: { userId: studentUser.id, roleId: studentRole, schoolId: school.id } },
      update: {},
      create: { userId: studentUser.id, roleId: studentRole, schoolId: school.id },
    });

    // Guardian records
    await prisma.guardian.upsert({
      where: { id: `guardian-${student.id}` },
      update: {},
      create: {
        id: `guardian-${student.id}`,
        studentId: student.id,
        firstName: s.first === "Halima" ? "Musa" : "Sunday",
        lastName: s.last,
        relationship: "Father",
        phone: `+234 81${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9000000) + 1000000}`,
        email: `guardian.${s.last.toLowerCase()}@email.com`,
        address: `12 ${s.state} Street, Lagos`,
        occupation: "Engineer",
        isPrimary: true,
      },
    });

    // Medical records
    await prisma.medicalRecord.upsert({
      where: { id: `medical-${student.id}` },
      update: {},
      create: {
        id: `medical-${student.id}`,
        studentId: student.id,
        bloodGroup: s.blood,
        allergies: Math.random() > 0.7 ? "None" : "Penicillin",
        conditions: "None",
        medications: "None",
        height: 150 + Math.floor(Math.random() * 30),
        weight: 45 + Math.floor(Math.random() * 25),
        emergencyContact: `Guardian of ${s.first}`,
        emergencyPhone: `+234 81${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9000000) + 1000000}`,
      },
    });

    // Student documents
    await prisma.studentDocument.upsert({
      where: { id: `doc-${student.id}-birth` },
      update: {},
      create: {
        id: `doc-${student.id}-birth`,
        studentId: student.id,
        name: "Birth Certificate",
        type: "birth_certificate",
        url: `https://storage.ffb.edu.ng/documents/${admNo}/birth_cert.pdf`,
        size: 245000,
      },
    });

    allStudents.push({ id: student.id, firstName: s.first, lastName: s.last, class: s.class, gender: s.gender });
  }
  console.log("✅ All students created:", allStudents.length);

  // Update original students with photos and blood groups
  for (let i = 0; i < studentsData.length; i++) {
    const s = studentsData[i];
    const admNo = `FFB/2024/${(i + 1).toString().padStart(4, "0")}`;
    await prisma.student.update({
      where: { admissionNumber: admNo },
      data: {
        photo: `https://ui-avatars.com/api/?name=${s.first}+${s.last}&background=random&size=200`,
        bloodGroup: ["A+", "O+", "B+", "AB+", "A-", "O-"][Math.floor(Math.random() * 6)],
        phone: `+234 80${Math.floor(Math.random() * 9)} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
        stateOfOrigin: ["Lagos", "Ogun", "Oyo", "Enugu", "Anambra", "Kano", "Kaduna", "Rivers"][Math.floor(Math.random() * 8)],
      },
    });
  }

  // ── Attendance Records (30 days) ──────────────────────────
  const currentTerm = termRecords["First Term"];
  const attendanceStatuses = ["present", "present", "present", "present", "present", "present", "present", "absent", "late", "present"];

  for (const student of allStudents) {
    for (let day = 0; day < 30; day++) {
      const date = new Date("2024-09-09");
      date.setDate(date.getDate() + day);
      if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends

      const status = attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)];
      const checkIn = status === "present" ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 7, 30 + Math.floor(Math.random() * 15)) :
                      status === "late" ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 5 + Math.floor(Math.random() * 25)) : null;

      await prisma.attendanceRecord.upsert({
        where: { studentId_date_session: { studentId: student.id, date, session: "morning" } },
        update: {},
        create: {
          studentId: student.id,
          classId: classRecords[student.class],
          termId: currentTerm,
          date,
          session: "morning",
          status,
          checkIn,
          notes: status === "absent" ? "No excuse" : undefined,
          recordedBy: teacherUser.id,
        },
      });
    }
  }
  console.log("✅ Attendance records created for 30 days");

  // ── Subjects lookup ────────────────────────────────────────
  const subjectRecords: Record<string, string> = {};
  const allSubjects = await prisma.subject.findMany({ where: { schoolId: school.id } });
  for (const sub of allSubjects) {
    subjectRecords[sub.code] = sub.id;
  }

  // ── Grades/Results ─────────────────────────────────────────
  const gradeDistribution = [
    { min: 75, max: 100, grade: "A1" },
    { min: 70, max: 74, grade: "B2" },
    { min: 65, max: 69, grade: "B3" },
    { min: 60, max: 64, grade: "C4" },
    { min: 55, max: 59, grade: "C5" },
    { min: 50, max: 54, grade: "C6" },
    { min: 45, max: 49, grade: "D7" },
    { min: 40, max: 44, grade: "E8" },
    { min: 0, max: 39, grade: "F9" },
  ];

  function getGrade(score: number): string {
    for (const g of gradeDistribution) {
      if (score >= g.min && score <= g.max) return g.grade;
    }
    return "F9";
  }

  function generateScore(base: number, variance: number): number {
    const score = base + (Math.random() * variance * 2 - variance);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Subjects for senior classes
  const seniorSubjects = ["MTH", "ENG", "PHY", "CHM", "BIO", "ECO", "LIT", "GOV", "CMP"];
  const juniorSubjects = ["MTH", "ENG", "CIV", "AGR", "CRS"];

  // Create grades for SS3 and SS2 students
  for (const student of allStudents) {
    if (student.class !== "SS3" && student.class !== "SS2") continue;

    const studentSubjects = seniorSubjects;
    for (const subCode of studentSubjects) {
      const subjectId = subjectRecords[subCode];
      if (!subjectId) continue;

      // CA1 (20 marks)
      const ca1Score = generateScore(14, 4);
      await prisma.grade.upsert({
        where: { studentId_subjectId_type_term_session: { studentId: student.id, subjectId, type: "CA1", term: "First Term", session: "2024/2025" } },
        update: {},
        create: {
          studentId: student.id,
          subjectId,
          teacherId: teacher.id,
          type: "CA1",
          score: ca1Score,
          maxScore: 20,
          grade: getGrade((ca1Score / 20) * 100),
          term: "First Term",
          session: "2024/2025",
        },
      });

      // CA2 (20 marks)
      const ca2Score = generateScore(15, 4);
      await prisma.grade.upsert({
        where: { studentId_subjectId_type_term_session: { studentId: student.id, subjectId, type: "CA2", term: "First Term", session: "2024/2025" } },
        update: {},
        create: {
          studentId: student.id,
          subjectId,
          teacherId: teacher.id,
          type: "CA2",
          score: ca2Score,
          maxScore: 20,
          grade: getGrade((ca2Score / 20) * 100),
          term: "First Term",
          session: "2024/2025",
        },
      });

      // Exam (60 marks)
      const examScore = generateScore(38, 12);
      await prisma.grade.upsert({
        where: { studentId_subjectId_type_term_session: { studentId: student.id, subjectId, type: "Exam", term: "First Term", session: "2024/2025" } },
        update: {},
        create: {
          studentId: student.id,
          subjectId,
          teacherId: teacher.id,
          type: "Exam",
          score: examScore,
          maxScore: 60,
          grade: getGrade((examScore / 60) * 100),
          term: "First Term",
          session: "2024/2025",
        },
      });
    }
  }

  // Create grades for JSS students
  for (const student of allStudents) {
    if (student.class !== "JSS1" && student.class !== "JSS2" && student.class !== "JSS3") continue;

    const studentSubjects = juniorSubjects;
    for (const subCode of studentSubjects) {
      const subjectId = subjectRecords[subCode];
      if (!subjectId) continue;

      const ca1Score = generateScore(13, 5);
      await prisma.grade.upsert({
        where: { studentId_subjectId_type_term_session: { studentId: student.id, subjectId, type: "CA1", term: "First Term", session: "2024/2025" } },
        update: {},
        create: {
          studentId: student.id,
          subjectId,
          teacherId: teacher.id,
          type: "CA1",
          score: ca1Score,
          maxScore: 20,
          grade: getGrade((ca1Score / 20) * 100),
          term: "First Term",
          session: "2024/2025",
        },
      });

      const ca2Score = generateScore(14, 4);
      await prisma.grade.upsert({
        where: { studentId_subjectId_type_term_session: { studentId: student.id, subjectId, type: "CA2", term: "First Term", session: "2024/2025" } },
        update: {},
        create: {
          studentId: student.id,
          subjectId,
          teacherId: teacher.id,
          type: "CA2",
          score: ca2Score,
          maxScore: 20,
          grade: getGrade((ca2Score / 20) * 100),
          term: "First Term",
          session: "2024/2025",
        },
      });

      const examScore = generateScore(35, 13);
      await prisma.grade.upsert({
        where: { studentId_subjectId_type_term_session: { studentId: student.id, subjectId, type: "Exam", term: "First Term", session: "2024/2025" } },
        update: {},
        create: {
          studentId: student.id,
          subjectId,
          teacherId: teacher.id,
          type: "Exam",
          score: examScore,
          maxScore: 60,
          grade: getGrade((examScore / 60) * 100),
          term: "First Term",
          session: "2024/2025",
        },
      });
    }
  }
  console.log("✅ Grades created for all students");

  // ── Term Results ───────────────────────────────────────────
  for (const student of allStudents) {
    const grades = await prisma.grade.findMany({
      where: { studentId: student.id, term: "First Term", session: "2024/2025" },
    });

    const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
    const average = grades.length > 0 ? totalScore / grades.length : 0;

    // Count how many students are in this class for position calculation
    const classmates = allStudents.filter(s => s.class === student.class);
    const classSize = classmates.length;

    await prisma.termResult.upsert({
      where: { studentId_termId: { studentId: student.id, termId: currentTerm } },
      update: {},
      create: {
        studentId: student.id,
        termId: currentTerm,
        totalScore,
        average: Math.round(average * 100) / 100,
        position: Math.floor(Math.random() * classSize) + 1,
        classSize,
        remark: average >= 70 ? "Excellent" : average >= 60 ? "Very Good" : average >= 50 ? "Good" : average >= 40 ? "Fair" : "Needs Improvement",
        promoted: true,
      },
    });
  }
  console.log("✅ Term results created");

  // ── Report Cards (SS3 students) ───────────────────────────
  const behaviourRatings = ["Excellent", "Very Good", "Good", "Satisfactory", "Needs Improvement"];
  const teacherComments = [
    "A diligent and hardworking student who consistently demonstrates academic excellence.",
    "Shows great potential and has made significant improvement this term.",
    "A well-behaved student who is always eager to learn and participate.",
    "Needs to put in more effort to achieve desired results.",
    "An intelligent student who should focus more on academics.",
  ];
  const principalComments = [
    "Keep up the excellent work. You are a role model to your peers.",
    "We are proud of your progress. Continue to strive for greatness.",
    "Your dedication to learning is commendable. Aim higher next term.",
    "Work harder to improve your performance in the upcoming examinations.",
    "You have the potential to excel. Put in more effort.",
  ];

  for (const student of allStudents) {
    if (student.class !== "SS3") continue;

    const grades = await prisma.grade.findMany({
      where: { studentId: student.id, term: "First Term", session: "2024/2025" },
    });
    const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
    const average = grades.length > 0 ? totalScore / grades.length : 0;

    // Attendance summary
    const attendance = await prisma.attendanceRecord.findMany({
      where: { studentId: student.id },
    });
    const present = attendance.filter(a => a.status === "present").length;
    const absent = attendance.filter(a => a.status === "absent").length;
    const late = attendance.filter(a => a.status === "late").length;

    await prisma.reportCard.upsert({
      where: { studentId_termId: { studentId: student.id, termId: currentTerm } },
      update: {},
      create: {
        studentId: student.id,
        termId: currentTerm,
        academicYear: "2024/2025",
        attendanceSummary: { present, absent, late, total: present + absent + late },
        behaviour: behaviourRatings[Math.floor(Math.random() * behaviourRatings.length)],
        psychomotor: {
          handwriting: Math.floor(Math.random() * 5) + 1,
          drawing: Math.floor(Math.random() * 5) + 1,
          speaking: Math.floor(Math.random() * 5) + 1,
          reading: Math.floor(Math.random() * 5) + 1,
          playing: Math.floor(Math.random() * 5) + 1,
        },
        affective: {
          respect: Math.floor(Math.random() * 5) + 1,
          honesty: Math.floor(Math.random() * 5) + 1,
          cooperation: Math.floor(Math.random() * 5) + 1,
          perseverance: Math.floor(Math.random() * 5) + 1,
          selfControl: Math.floor(Math.random() * 5) + 1,
        },
        teacherComment: teacherComments[Math.floor(Math.random() * teacherComments.length)],
        principalComment: principalComments[Math.floor(Math.random() * principalComments.length)],
        feesSummary: {
          totalFees: 295000,
          amountPaid: Math.random() > 0.3 ? 295000 : Math.floor(Math.random() * 200000) + 50000,
          balance: Math.random() > 0.3 ? 0 : Math.floor(Math.random() * 150000) + 10000,
        },
      },
    });
  }
  console.log("✅ Report cards created for SS3 students");

  // ── Finance Data ───────────────────────────────────────────
  // School Fees
  const feeCategories = [
    { name: "Tuition Fee", description: "Academic tuition for the term", amount: 125000, type: "tuition" },
    { name: "Development Levy", description: "School infrastructure development", amount: 25000, type: "development" },
    { name: "Uniform Fee", description: "School uniform package", amount: 15000, type: "uniform" },
    { name: "Transport Fee", description: "School bus transportation", amount: 45000, type: "transport" },
    { name: "Hostel Fee", description: "Boarding accommodation", amount: 85000, type: "hostel" },
  ];

  const schoolFeeRecords: { id: string; name: string; amount: number }[] = [];
  for (const fee of feeCategories) {
    const record = await prisma.schoolFee.upsert({
      where: { id: `fee-${fee.type}` },
      update: {},
      create: {
        id: `fee-${fee.type}`,
        schoolId: school.id,
        name: fee.name,
        description: fee.description,
        amount: fee.amount,
        type: fee.type,
        term: "First Term",
        academicYear: "2024/2025",
        isMandatory: fee.type !== "transport" && fee.type !== "hostel",
      },
    });
    schoolFeeRecords.push({ id: record.id, name: fee.name, amount: fee.amount });
  }
  console.log("✅ School fees created");

  // Invoices and Payments
  let invoiceCount = 0;
  for (const student of allStudents) {
    const paymentStatus = Math.random();
    for (const fee of schoolFeeRecords) {
      const invoiceNumber = `INV-${student.class}-${(invoiceCount++).toString().padStart(5, "0")}`;

      const invoice = await prisma.invoice.upsert({
        where: { invoiceNumber },
        update: {},
        create: {
          studentId: student.id,
          schoolFeeId: fee.id,
          invoiceNumber,
          amount: fee.amount,
          totalAmount: fee.amount,
          dueDate: new Date("2024-10-31"),
          status: paymentStatus > 0.3 ? "paid" : paymentStatus > 0.1 ? "partial" : "unpaid",
        },
      });

      if (invoice.status === "paid") {
        await prisma.payment.upsert({
          where: { reference: `PAY-${invoiceNumber}` },
          update: {},
          create: {
            studentId: student.id,
            invoiceId: invoice.id,
            amount: fee.amount,
            method: ["bank_transfer", "card", "cash", "flutterwave"][Math.floor(Math.random() * 4)],
            reference: `PAY-${invoiceNumber}`,
            status: "completed",
            description: `Payment for ${fee.name}`,
            paidAt: new Date("2024-09-15"),
          },
        });
      } else if (invoice.status === "partial") {
        await prisma.payment.upsert({
          where: { reference: `PAY-${invoiceNumber}` },
          update: {},
          create: {
            studentId: student.id,
            invoiceId: invoice.id,
            amount: Math.floor(fee.amount * 0.5),
            method: "bank_transfer",
            reference: `PAY-${invoiceNumber}`,
            status: "completed",
            description: `Partial payment for ${fee.name}`,
            paidAt: new Date("2024-09-20"),
          },
        });
      }
    }
  }
  console.log("✅ Invoices and payments created");

  // Income Categories and Records
  const incomeCategories = await prisma.incomeCategory.upsert({
    where: { id: "cat-tuition" },
    update: {},
    create: { id: "cat-tuition", schoolId: school.id, name: "Tuition Income", description: "Income from student tuition fees" },
  });

  await prisma.incomeCategory.upsert({
    where: { id: "cat-transport" },
    update: {},
    create: { id: "cat-transport", schoolId: school.id, name: "Transport Income", description: "Income from transport services" },
  });

  await prisma.incomeCategory.upsert({
    where: { id: "cat-hostel" },
    update: {},
    create: { id: "cat-hostel", schoolId: school.id, name: "Hostel Income", description: "Income from hostel accommodations" },
  });

  await prisma.income.upsert({
    where: { id: "income-tuition-sep" },
    update: {},
    create: {
      id: "income-tuition-sep",
      schoolId: school.id,
      categoryId: "cat-tuition",
      title: "September Tuition Collections",
      amount: 2500000,
      date: new Date("2024-09-30"),
      reference: "INC-2024-001",
      notes: "Tuition collection for September 2024",
      recordedBy: "System",
    },
  });

  await prisma.income.upsert({
    where: { id: "income-transport-sep" },
    update: {},
    create: {
      id: "income-transport-sep",
      schoolId: school.id,
      categoryId: "cat-transport",
      title: "September Transport Fees",
      amount: 450000,
      date: new Date("2024-09-30"),
      reference: "INC-2024-002",
      notes: "Transport fees for September 2024",
      recordedBy: "System",
    },
  });
  console.log("✅ Income records created");

  // Expenses
  const expenseCategories = [
    { category: "salary", title: "September Staff Salaries", amount: 3500000, vendor: "Internal", status: "approved" },
    { category: "infrastructure", title: "Classroom Renovation", amount: 450000, vendor: "BuildRight Construction", status: "approved" },
    { category: "utilities", title: "Electricity Bill - September", amount: 185000, vendor: "Ikeja Electric", status: "approved" },
    { category: "utilities", title: "Water Supply - September", amount: 75000, vendor: "Lagos Water Corporation", status: "approved" },
    { category: "supplies", title: "Textbooks Purchase", amount: 320000, vendor: "Lagos Booksellers", status: "approved" },
    { category: "supplies", title: "Laboratory Equipment", amount: 280000, vendor: "Science Equipment Nigeria", status: "pending" },
    { category: "maintenance", title: "Generator Maintenance", amount: 120000, vendor: "PowerTech Services", status: "approved" },
    { category: "transport", title: "School Bus Fuel", amount: 95000, vendor: "NNPC Filling Station", status: "approved" },
  ];

  for (let i = 0; i < expenseCategories.length; i++) {
    const exp = expenseCategories[i];
    await prisma.expense.upsert({
      where: { id: `expense-${i + 1}` },
      update: {},
      create: {
        id: `expense-${i + 1}`,
        schoolId: school.id,
        category: exp.category,
        title: exp.title,
        amount: exp.amount,
        date: new Date("2024-09-" + (15 + i).toString().padStart(2, "0")),
        reference: `EXP-2024-${(i + 1).toString().padStart(3, "0")}`,
        vendor: exp.vendor,
        notes: `${exp.title} for September 2024`,
        approvedBy: "System Administrator",
        status: exp.status,
      },
    });
  }
  console.log("✅ Expense records created");

  // ── Hostel Data ────────────────────────────────────────────
  const boysHostel = await prisma.hostel.upsert({
    where: { id: "hostel-boys" },
    update: {},
    create: {
      id: "hostel-boys",
      schoolId: school.id,
      name: "Boys Quarters",
      type: "male",
      capacity: 80,
      address: "Block A & B, East Wing",
      status: "active",
    },
  });

  const girlsHostel = await prisma.hostel.upsert({
    where: { id: "hostel-girls" },
    update: {},
    create: {
      id: "hostel-girls",
      schoolId: school.id,
      name: "Girls Quarters",
      type: "female",
      capacity: 80,
      address: "Block C & D, West Wing",
      status: "active",
    },
  });

  // Create rooms and beds
  const allRooms: { id: string; hostelId: string; number: string }[] = [];

  // Block A (Boys)
  for (let room = 1; room <= 10; room++) {
    const roomRecord = await prisma.hostelRoom.upsert({
      where: { hostelId_number: { hostelId: boysHostel.id, number: `Block A Room ${room}` } },
      update: {},
      create: {
        hostelId: boysHostel.id,
        number: `Block A Room ${room}`,
        floor: Math.ceil(room / 5),
        capacity: 4,
        type: "shared",
        price: 85000,
      },
    });

    for (let bed = 1; bed <= 4; bed++) {
      await prisma.hostelBed.upsert({
        where: { id: `bed-a${room}-${bed}` },
        update: {},
        create: { id: `bed-a${room}-${bed}`, roomId: roomRecord.id, number: bed, status: "available" },
      });
    }
    allRooms.push({ id: roomRecord.id, hostelId: boysHostel.id, number: `Block A Room ${room}` });
  }

  // Block B (Boys)
  for (let room = 1; room <= 10; room++) {
    const roomRecord = await prisma.hostelRoom.upsert({
      where: { hostelId_number: { hostelId: boysHostel.id, number: `Block B Room ${room}` } },
      update: {},
      create: {
        hostelId: boysHostel.id,
        number: `Block B Room ${room}`,
        floor: Math.ceil(room / 5) + 1,
        capacity: 4,
        type: "shared",
        price: 85000,
      },
    });

    for (let bed = 1; bed <= 4; bed++) {
      await prisma.hostelBed.upsert({
        where: { id: `bed-b${room}-${bed}` },
        update: {},
        create: { id: `bed-b${room}-${bed}`, roomId: roomRecord.id, number: bed, status: "available" },
      });
    }
    allRooms.push({ id: roomRecord.id, hostelId: boysHostel.id, number: `Block B Room ${room}` });
  }

  // Block C (Girls)
  for (let room = 1; room <= 10; room++) {
    const roomRecord = await prisma.hostelRoom.upsert({
      where: { hostelId_number: { hostelId: girlsHostel.id, number: `Block C Room ${room}` } },
      update: {},
      create: {
        hostelId: girlsHostel.id,
        number: `Block C Room ${room}`,
        floor: Math.ceil(room / 5),
        capacity: 4,
        type: "shared",
        price: 85000,
      },
    });

    for (let bed = 1; bed <= 4; bed++) {
      await prisma.hostelBed.upsert({
        where: { id: `bed-c${room}-${bed}` },
        update: {},
        create: { id: `bed-c${room}-${bed}`, roomId: roomRecord.id, number: bed, status: "available" },
      });
    }
    allRooms.push({ id: roomRecord.id, hostelId: girlsHostel.id, number: `Block C Room ${room}` });
  }

  // Block D (Girls)
  for (let room = 1; room <= 10; room++) {
    const roomRecord = await prisma.hostelRoom.upsert({
      where: { hostelId_number: { hostelId: girlsHostel.id, number: `Block D Room ${room}` } },
      update: {},
      create: {
        hostelId: girlsHostel.id,
        number: `Block D Room ${room}`,
        floor: Math.ceil(room / 5) + 1,
        capacity: 4,
        type: "shared",
        price: 85000,
      },
    });

    for (let bed = 1; bed <= 4; bed++) {
      await prisma.hostelBed.upsert({
        where: { id: `bed-d${room}-${bed}` },
        update: {},
        create: { id: `bed-d${room}-${bed}`, roomId: roomRecord.id, number: bed, status: "available" },
      });
    }
    allRooms.push({ id: roomRecord.id, hostelId: girlsHostel.id, number: `Block D Room ${room}` });
  }

  // Allocate some students to rooms
  const boysStudents = allStudents.filter(s => s.gender === "Male");
  const girlsStudents = allStudents.filter(s => s.gender === "Female");

  for (let i = 0; i < Math.min(boysStudents.length, 8); i++) {
    const roomIndex = Math.floor(i / 4);
    const bedNumber = (i % 4) + 1;
    const hostelId = roomIndex < 2 ? boysHostel.id : boysHostel.id;
    const roomNumber = roomIndex < 2 ? `Block A Room ${roomIndex + 1}` : `Block B Room ${roomIndex - 1}`;
    const room = allRooms.find(r => r.number === roomNumber && r.hostelId === hostelId);

    if (room) {
      await prisma.hostelAllocation.upsert({
        where: { studentId_status: { studentId: boysStudents[i].id, status: "active" } },
        update: {},
        create: {
          studentId: boysStudents[i].id,
          roomId: room.id,
          hostelId: hostelId,
          bedNumber,
          startDate: new Date("2024-09-09"),
          status: "active",
        },
      });
    }
  }

  for (let i = 0; i < Math.min(girlsStudents.length, 8); i++) {
    const roomIndex = Math.floor(i / 4);
    const bedNumber = (i % 4) + 1;
    const roomNumber = roomIndex < 2 ? `Block C Room ${roomIndex + 1}` : `Block D Room ${roomIndex - 1}`;
    const room = allRooms.find(r => r.number === roomNumber && r.hostelId === girlsHostel.id);

    if (room) {
      await prisma.hostelAllocation.upsert({
        where: { studentId_status: { studentId: girlsStudents[i].id, status: "active" } },
        update: {},
        create: {
          studentId: girlsStudents[i].id,
          roomId: room.id,
          hostelId: girlsHostel.id,
          bedNumber,
          startDate: new Date("2024-09-09"),
          status: "active",
        },
      });
    }
  }
  console.log("✅ Hostel data created (2 hostels, 40 rooms, 160 beds, allocations)");

  // ── Library Data ───────────────────────────────────────────
  const libraryBooks = [
    { isbn: "978-0134685991", title: "New Senior Mathematics for SS1-3", author: "J.B. Channon", publisher: "Longman", category: "Mathematics", copies: 50 },
    { isbn: "978-0195760194", title: "New Concept English for Junior Secondary", author: "T.E. Kola", publisher: "Oxford", category: "English", copies: 40 },
    { isbn: "978-1408220740", title: "Oxford Comprehensive Mathematics", author: "A.O. Badmus", publisher: "Oxford", category: "Mathematics", copies: 35 },
    { isbn: "978-9780293640", title: "Essential Physics for West Africa", author: "M.I. Offorma", publisher: " Africana-FEP", category: "Physics", copies: 30 },
    { isbn: "978-9780293657", title: "New School Chemistry for Senior Secondary", author: "O.Y. Ababio", publisher: "Africana-FEP", category: "Chemistry", copies: 30 },
    { isbn: "978-9781380015", title: "Spectrum Biology for SS1-3", author: "S.A. Anyakoha", publisher: "Spectrum", category: "Biology", copies: 25 },
    { isbn: "978-9780293664", title: "Amalgamated Economics for Senior Secondary", author: "R.A.I. Nwankwo", publisher: "Africana-FEP", category: "Economics", copies: 30 },
    { isbn: "978-9780293671", title: "Government for Senior Secondary Schools", author: "J.U. Anyaele", publisher: "Africana-FEP", category: "Government", copies: 25 },
    { isbn: "978-9780293688", title: "Literature-in-English for Senior Secondary", author: "D.I. Nwaozuzu", publisher: "Africana-FEP", category: "Literature", copies: 20 },
    { isbn: "978-0195760195", title: "New Oxford ICT for Junior Secondary", author: "F.C. Nwosu", publisher: "Oxford", category: "Computer Science", copies: 30 },
    { isbn: "978-9780293695", title: "Nigerian History for Senior Secondary", author: "O. Oluwadare", publisher: "Africana-FEP", category: "History", copies: 20 },
    { isbn: "978-9780293701", title: "Further Mathematics for SS1-3", author: "T. Chimaobi", publisher: "Africana-FEP", category: "Mathematics", copies: 25 },
    { isbn: "978-9780293718", title: "Christian Religious Studies for SS1-3", author: "P.O. Adebayo", publisher: "Africana-FEP", category: "CRS", copies: 20 },
    { isbn: "978-9780293725", title: "Agricultural Science for Junior Secondary", author: "A.B. Oyekan", publisher: "Africana-FEP", category: "Agriculture", copies: 30 },
    { isbn: "978-9780293732", title: "Civic Education for Senior Secondary", author: "F.O.C. Nwankwo", publisher: "Africana-FEP", category: "Civic Education", copies: 25 },
  ];

  const libraryBookRecords: string[] = [];
  for (const book of libraryBooks) {
    const existing = await prisma.libraryBook.findFirst({ where: { title: book.title, schoolId: school.id } });
    if (!existing) {
      await prisma.libraryBook.create({
        data: {
          schoolId: school.id,
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          publisher: book.publisher,
          category: book.category,
          copies: book.copies,
          available: book.copies,
          status: "available",
        },
      });
    }
  }

  // Create borrowing records
  for (let i = 0; i < 10; i++) {
    const studentIndex = Math.floor(Math.random() * allStudents.length);
    const bookIndex = Math.floor(Math.random() * libraryBookRecords.length);
    const borrowDate = new Date("2024-09-" + (Math.floor(Math.random() * 25) + 1).toString().padStart(2, "0"));
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14);

    await prisma.libraryBorrowing.upsert({
      where: { id: `borrow-${i + 1}` },
      update: {},
      create: {
        id: `borrow-${i + 1}`,
        studentId: allStudents[studentIndex].id,
        bookId: libraryBookRecords[bookIndex],
        borrowDate,
        dueDate,
        returnDate: i < 7 ? new Date(borrowDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000) : null,
        status: i < 7 ? "returned" : "borrowed",
        penalty: i === 8 ? 500 : null,
      },
    });
  }
  console.log("✅ Library data created (15 books, 10 borrowings)");

  // ── Teacher Performance ────────────────────────────────────
  const performancePeriods = ["September 2024", "October 2024", "November 2024"];
  for (const period of performancePeriods) {
    await prisma.teacherPerformance.upsert({
      where: { id: `perf-${teacher.id}-${period.replace(" ", "-").toLowerCase()}` },
      update: {},
      create: {
        id: `perf-${teacher.id}-${period.replace(" ", "-").toLowerCase()}`,
        teacherId: teacher.id,
        period,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        comments: "Demonstrates excellent teaching methodology and strong student engagement.",
        reviewedBy: adminUser.id,
      },
    });
  }
  console.log("✅ Teacher performance records created");

  // ── Class-Subject Assignments ──────────────────────────────
  for (const clsName of ["SS3", "SS2", "SS1"]) {
    for (const subCode of seniorSubjects) {
      const subjectId = subjectRecords[subCode];
      if (subjectId) {
        await prisma.classSubject.upsert({
          where: { classId_subjectId: { classId: classRecords[clsName], subjectId } },
          update: {},
          create: {
            classId: classRecords[clsName],
            subjectId,
            teacherId: teacher.id,
          },
        });
      }
    }
  }
  console.log("✅ Class-Subject assignments created");

  // ── Teacher-Subject Assignments ────────────────────────────
  for (const subCode of seniorSubjects) {
    const subjectId = subjectRecords[subCode];
    if (subjectId) {
      await prisma.teacherSubject.upsert({
        where: { teacherId_subjectId: { teacherId: teacher.id, subjectId } },
        update: {},
        create: { teacherId: teacher.id, subjectId },
      });
    }
  }
  console.log("✅ Teacher-Subject assignments created");

  // ── Class-Term Assignments ─────────────────────────────────
  for (const clsName of ["SS3", "SS2", "SS1", "JSS3", "JSS2", "JSS1"]) {
    await prisma.classTerm.upsert({
      where: { classId_termId: { classId: classRecords[clsName], termId: currentTerm } },
      update: {},
      create: {
        classId: classRecords[clsName],
        termId: currentTerm,
        teacherId: teacher.id,
      },
    });
  }
  console.log("✅ Class-Term assignments created");

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
