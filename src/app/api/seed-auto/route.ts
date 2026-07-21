import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json({ success: true, message: "Database already seeded", userCount });
    }

    // 1. School
    const school = await prisma.school.upsert({
      where: { slug: "ffb-main" },
      update: {},
      create: {
        name: "FFB Group of Schools", slug: "ffb-main", email: "info@ffb.edu.ng",
        phone: "+234 905 998 0991", address: "123 Education Avenue, GRA",
        city: "Lagos", state: "Lagos", country: "Nigeria",
        motto: "Knowledge, Excellence, Integrity", type: "secondary", status: "active",
      },
    });

    // 2. Roles
    const roleData = [
      { name: "OWNER", level: 100, description: "School Owner" },
      { name: "ADMINISTRATOR", level: 80, description: "School Administrator" },
      { name: "PRINCIPAL", level: 75, description: "School Principal" },
      { name: "VICE_PRINCIPAL", level: 70, description: "Vice Principal" },
      { name: "ACCOUNTANT", level: 65, description: "School Accountant" },
      { name: "AUDITOR", level: 60, description: "Financial Auditor" },
      { name: "TEACHER", level: 50, description: "Subject Teacher" },
      { name: "LIBRARIAN", level: 45, description: "School Librarian" },
      { name: "PORTER", level: 40, description: "Hostel Porter" },
      { name: "PARENT", level: 20, description: "Student Parent/Guardian" },
      { name: "ALUMNI", level: 15, description: "School Alumni" },
      { name: "STUDENT", level: 10, description: "Student" },
    ];
    const roles: Record<string, string> = {};
    for (const r of roleData) {
      const role = await prisma.role.upsert({ where: { name: r.name }, update: {}, create: r });
      roles[r.name] = role.id;
    }

    // 3. Users
    const pw = async (p: string) => bcrypt.hash(p, 10);
    const accounts = [
      { email: "owner@ffb.edu.ng", name: "Chief Okonkwo", password: await pw("owner123"), phone: "+2348000000001", role: "OWNER" },
      { email: "admin@ffb.edu.ng", name: "Admin User", password: await pw("admin123"), phone: "+2348012345678", role: "ADMINISTRATOR" },
      { email: "principal@ffb.edu.ng", name: "Dr. Aisha Bello", password: await pw("principal123"), phone: "+2348012345679", role: "PRINCIPAL" },
      { email: "vp@ffb.edu.ng", name: "Mr. Chinedu Okafor", password: await pw("vp123"), phone: "+2348012345680", role: "VICE_PRINCIPAL" },
      { email: "accountant@ffb.edu.ng", name: "Mrs. Funke Adeyemi", password: await pw("accountant123"), phone: "+2348012345681", role: "ACCOUNTANT" },
      { email: "auditor@ffb.edu.ng", name: "Mr. Tunde Williams", password: await pw("auditor123"), phone: "+2348012345682", role: "AUDITOR" },
      { email: "teacher@ffb.edu.ng", name: "Fatima Bello", password: await pw("teacher123"), phone: "+2348023456789", role: "TEACHER" },
      { email: "librarian@ffb.edu.ng", name: "Grace Nwosu", password: await pw("librarian123"), phone: "+2348012345683", role: "LIBRARIAN" },
      { email: "porter@ffb.edu.ng", name: "Ibrahim Musa", password: await pw("porter123"), phone: "+2348012345684", role: "PORTER" },
      { email: "parent@ffb.edu.ng", name: "Mrs. Ngozi Johnson", password: await pw("parent123"), phone: "+2348012345685", role: "PARENT" },
      { email: "alumni@ffb.edu.ng", name: "Emeka Obi", password: await pw("alumni123"), phone: "+2348012345686", role: "ALUMNI" },
      { email: "adebayo.johnson@student.ffb.edu.ng", name: "Adebayo Johnson", password: await pw("student123"), phone: "+2348034567890", role: "STUDENT" },
    ];

    const userIds: Record<string, string> = {};
    for (const a of accounts) {
      const user = await prisma.user.upsert({
        where: { email: a.email },
        update: { password: a.password },
        create: { email: a.email, name: a.name, password: a.password, phone: a.phone, schoolId: school.id },
      });
      await prisma.userRole.upsert({
        where: { userId_roleId_schoolId: { userId: user.id, roleId: roles[a.role], schoolId: school.id } },
        update: {},
        create: { userId: user.id, roleId: roles[a.role], schoolId: school.id },
      });
      userIds[a.role] = user.id;
    }

    // 4. Academic Year & Term
    const academicYear = await prisma.academicYear.upsert({
      where: { schoolId_name: { schoolId: school.id, name: "2025/2026" } },
      update: {},
      create: {
        schoolId: school.id, name: "2025/2026",
        startDate: new Date("2025-09-08"), endDate: new Date("2026-07-17"),
        isCurrent: true,
      },
    });

    const term = await prisma.term.upsert({
      where: { academicYearId_name: { academicYearId: academicYear.id, name: "First Term" } },
      update: {},
      create: {
        schoolId: school.id, academicYearId: academicYear.id, name: "First Term",
        startDate: new Date("2025-09-08"), endDate: new Date("2025-12-19"),
        isCurrent: true,
      },
    });

    // 5. Subjects
    const subjectDefs = [
      { name: "Mathematics", code: "MTH" },
      { name: "English Language", code: "ENG" },
      { name: "Basic Science", code: "BSC" },
      { name: "Social Studies", code: "SOS" },
      { name: "Civic Education", code: "CVE" },
      { name: "Computer Studies", code: "CMP" },
      { name: "Agricultural Science", code: "AGR" },
      { name: "Creative Arts", code: "ART" },
      { name: "Physical & Health Education", code: "PHE" },
      { name: "Home Economics", code: "HEC" },
    ];
    const subjects: Record<string, string> = {};
    for (const s of subjectDefs) {
      const sub = await prisma.subject.upsert({
        where: { schoolId_code: { schoolId: school.id, code: s.code } },
        update: {},
        create: { ...s, schoolId: school.id },
      });
      subjects[s.code] = sub.id;
    }

    // 6. Classes
    const classDefs = [
      { name: "Nursery 1", displayName: "Nursery 1", level: 1 },
      { name: "Nursery 2", displayName: "Nursery 2", level: 1 },
      { name: "Primary 1", displayName: "Primary 1", level: 2 },
      { name: "Primary 2", displayName: "Primary 2", level: 2 },
      { name: "Primary 3", displayName: "Primary 3", level: 2 },
      { name: "Primary 4", displayName: "Primary 4", level: 2 },
      { name: "Primary 5", displayName: "Primary 5", level: 2 },
      { name: "Primary 6", displayName: "Primary 6", level: 2 },
      { name: "JSS 1", displayName: "Junior Secondary 1", level: 3 },
      { name: "JSS 2", displayName: "Junior Secondary 2", level: 3 },
      { name: "JSS 3", displayName: "Junior Secondary 3", level: 3 },
      { name: "SSS 1", displayName: "Senior Secondary 1", level: 4 },
      { name: "SSS 2", displayName: "Senior Secondary 2", level: 4 },
      { name: "SSS 3", displayName: "Senior Secondary 3", level: 4 },
    ];
    const classes: Record<string, string> = {};
    for (const c of classDefs) {
      const cls = await prisma.schoolClass.upsert({
        where: { schoolId_name_academicYearId: { schoolId: school.id, name: c.name, academicYearId: academicYear.id } },
        update: {},
        create: {
          ...c, schoolId: school.id, academicYearId: academicYear.id, capacity: 40,
          classTeacherId: c.name === "JSS 1" ? userIds.TEACHER : undefined,
        },
      });
      classes[c.name] = cls.id;
    }

    // 7. ClassSubjects (link subjects to classes)
    const coreSubjects = ["MTH", "ENG", "BSC", "SOS", "CVE", "CMP"];
    for (const clsName of ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"]) {
      for (const subCode of coreSubjects) {
        await prisma.classSubject.upsert({
          where: { classId_subjectId: { classId: classes[clsName], subjectId: subjects[subCode] } },
          update: {},
          create: { classId: classes[clsName], subjectId: subjects[subCode] },
        });
      }
    }

    // 8. Teacher (linked to teacher user)
    const teacher = await prisma.teacher.upsert({
      where: { employeeId: "TCH001" },
      update: {},
      create: {
        schoolId: school.id, employeeId: "TCH001",
        firstName: "Fatima", lastName: "Bello", email: "teacher@ffb.edu.ng",
        phone: "+2348023456789", qualification: "B.Sc Mathematics",
        specialization: "Mathematics", hireDate: new Date("2023-09-01"), status: "active",
        userId: userIds.TEACHER,
      },
    });

    // TeacherSubjects
    for (const subCode of ["MTH", "BSC"]) {
      await prisma.teacherSubject.upsert({
        where: { teacherId_subjectId: { teacherId: teacher.id, subjectId: subjects[subCode] } },
        update: {},
        create: { teacherId: teacher.id, subjectId: subjects[subCode] },
      });
    }

    // 9. Students (20 students across classes)
    const studentDefs = [
      { first: "Adebayo", last: "Johnson", gender: "Male", class: "JSS 1", email: "adebayo.johnson@student.ffb.edu.ng" },
      { first: "Chidinma", last: "Okafor", gender: "Female", class: "JSS 1" },
      { first: "Emeka", last: "Nwachukwu", gender: "Male", class: "JSS 1" },
      { first: "Fatima", last: "Abdullahi", gender: "Female", class: "JSS 2" },
      { first: "Ibrahim", last: "Musa", gender: "Male", class: "JSS 2" },
      { first: "Kemi", last: "Adeyemi", gender: "Female", class: "JSS 3" },
      { first: "Olumide", last: "Akinwale", gender: "Male", class: "JSS 3" },
      { first: "Ngozi", last: "Eze", gender: "Female", class: "SSS 1" },
      { first: "Tunde", last: "Williams", gender: "Male", class: "SSS 1" },
      { first: "Aisha", last: "Bello", gender: "Female", class: "SSS 1" },
      { first: "Chukwuemeka", last: "Obi", gender: "Male", class: "SSS 2" },
      { first: "Blessing", last: "Okonkwo", gender: "Female", class: "SSS 2" },
      { first: "Yusuf", last: "Abubakar", gender: "Male", class: "SSS 3" },
      { first: "Folake", last: "Bankole", gender: "Female", class: "SSS 3" },
      { first: "Daniel", last: "Igwe", gender: "Male", class: "Primary 4" },
      { first: "Grace", last: "Nwosu", gender: "Female", class: "Primary 4" },
      { first: " Samuel", last: "Olawale", gender: "Male", class: "Primary 5" },
      { first: "Blessing", last: "Effiong", gender: "Female", class: "Primary 5" },
      { first: "Musa", last: "Aliyu", gender: "Male", class: "Primary 6" },
      { first: "Esther", last: "Okoro", gender: "Female", class: "Primary 6" },
    ];

    const students: { id: string; email?: string; class: string; first: string; last: string }[] = [];
    for (let i = 0; i < studentDefs.length; i++) {
      const sd = studentDefs[i];
      const admNum = `FFB/${new Date().getFullYear()}/${(i + 1).toString().padStart(4, "0")}`;
      const student = await prisma.student.upsert({
        where: { admissionNumber: admNum },
        update: {},
        create: {
          admissionNumber: admNum,
          schoolId: school.id,
          classId: classes[sd.class],
          firstName: sd.first.trim(),
          lastName: sd.last,
          gender: sd.gender,
          dateOfBirth: new Date(`201${10 + (i % 5)}-0${(i % 9) + 1}-15`),
          nationality: "Nigerian",
          email: sd.email,
          status: "active",
          enrollmentDate: new Date("2025-09-08"),
          qrCode: `QR-STU-${(i + 1).toString().padStart(4, "0")}`,
        },
      });
      students.push({ id: student.id, email: sd.email, class: sd.class, first: sd.first, last: sd.last });
    }

    // 10. Guardian (linked to parent user email — CRITICAL for parent dashboard)
    // Parent user email = "parent@ffb.edu.ng" — must match guardian email
    const parentStudent = students.find(s => s.email === "adebayo.johnson@student.ffb.edu.ng");
    if (parentStudent) {
      await prisma.guardian.create({
        data: {
          studentId: parentStudent.id,
          firstName: "Ngozi",
          lastName: "Johnson",
          relationship: "Mother",
          phone: "+2348012345685",
          email: "parent@ffb.edu.ng",
          address: "12 Education Lane, Lagos",
          occupation: "Doctor",
          isPrimary: true,
        },
      });
    }

    // Also create guardians for a few other students (same parent, multiple children)
    const secondChild = students.find(s => s.first === "Chidinma" && s.last === "Okafor");
    if (secondChild) {
      await prisma.guardian.create({
        data: {
          studentId: secondChild.id,
          firstName: "Ngozi",
          lastName: "Johnson",
          relationship: "Guardian",
          phone: "+2348012345685",
          email: "parent@ffb.edu.ng",
          address: "12 Education Lane, Lagos",
          occupation: "Doctor",
          isPrimary: false,
        },
      });
    }

    // 11. School Fees
    const feeNames = ["Tuition Fee", "Development Levy", "Science Equipment", "Sports Fee"];
    const fees: { id: string; amount: number }[] = [];
    for (const fname of feeNames) {
      const fee = await prisma.schoolFee.upsert({
        where: { id: `fee-${fname.toLowerCase().replace(/\s/g, "-")}` },
        update: {},
        create: {
          id: `fee-${fname.toLowerCase().replace(/\s/g, "-")}`,
          schoolId: school.id, name: fname,
          amount: fname === "Tuition Fee" ? 250000 : fname === "Development Levy" ? 50000 : fname === "Science Equipment" ? 30000 : 20000,
          type: "tuition", term: "First Term", academicYear: "2025/2026", isMandatory: true,
        },
      });
      fees.push({ id: fee.id, amount: fee.amount });
    }

    // 12. Invoices & Payments (for first 10 students)
    for (let i = 0; i < Math.min(10, students.length); i++) {
      const stu = students[i];
      const totalAmount = fees.reduce((s, f) => s + f.amount, 0);
      const invNum = `INV-${new Date().getFullYear()}-${(i + 1).toString().padStart(4, "0")}`;
      const invoice = await prisma.invoice.upsert({
        where: { invoiceNumber: invNum },
        update: {},
        create: {
          studentId: stu.id,
          schoolFeeId: fees[0].id,
          invoiceNumber: invNum,
          amount: totalAmount,
          totalAmount,
          dueDate: new Date("2025-12-31"),
          status: i < 7 ? "paid" : "unpaid",
        },
      });

      // Payments for paid invoices
      if (i < 7) {
        const paidDaysAgo = (7 - i) * 3;
        const paidDate = new Date();
        paidDate.setDate(paidDate.getDate() - paidDaysAgo);

        await prisma.payment.upsert({
          where: { reference: `PAY-${new Date().getFullYear()}-${(i + 1).toString().padStart(4, "0")}` },
          update: {},
          create: {
            studentId: stu.id,
            invoiceId: invoice.id,
            amount: totalAmount,
            method: i % 2 === 0 ? "bank_transfer" : "cash",
            reference: `PAY-${new Date().getFullYear()}-${(i + 1).toString().padStart(4, "0")}`,
            status: "completed",
            description: `Payment for ${feeNames[0]}`,
            paidAt: paidDate,
            receiptNumber: `RCT-${Date.now()}-${i}`,
          },
        });
      }
    }

    // 13. Attendance Records (today + last few days)
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const date = new Date(todayStart);
      date.setDate(date.getDate() - dayOffset);
      if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends

      for (let i = 0; i < students.length; i++) {
        const stu = students[i];
        const statuses = ["present", "present", "present", "present", "absent", "late"];
        const status = statuses[(i + dayOffset) % statuses.length];

        try {
          await prisma.attendanceRecord.upsert({
            where: { studentId_date_session: { studentId: stu.id, date, session: "morning" } },
            update: {},
            create: {
              studentId: stu.id,
              classId: classes[stu.class],
              termId: term.id,
              date,
              session: "morning",
              status,
              recordedBy: "Fatima Bello",
            },
          });
        } catch {
          // Skip duplicate if unique constraint hit
        }
      }
    }

    // 14. Grades (for each student, 3-4 subjects)
    const gradeTypes = ["ca1", "ca2", "exam"];
    const session = "2025/2026";
    const termName = "First Term";
    for (let i = 0; i < students.length; i++) {
      const stu = students[i];
      const studentSubjects = ["MTH", "ENG", "BSC", "CMP"];

      for (const subCode of studentSubjects) {
        for (const gtype of gradeTypes) {
          const baseScore = 40 + Math.floor(Math.random() * 40);
          const score = gtype === "exam" ? baseScore + 10 : baseScore;
          const letterGrade = score >= 75 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : score >= 40 ? "D" : "F";

          try {
            await prisma.grade.upsert({
              where: { studentId_subjectId_type_term_session: {
                studentId: stu.id, subjectId: subjects[subCode], type: gtype, term: termName, session,
              }},
              update: {},
              create: {
                studentId: stu.id,
                subjectId: subjects[subCode],
                teacherId: teacher.id,
                type: gtype,
                score: Math.min(score, 100),
                maxScore: 100,
                grade: letterGrade,
                term: termName,
                session,
              },
            });
          } catch {
            // Skip if already exists
          }
        }
      }
    }

    // 15. Applicants (5 pending/reviewed applications)
    const applicantDefs = [
      { first: "Chisom", last: "Adeyemi", email: "chisom@example.com", class: "JSS 1", status: "pending" },
      { first: "Tunde", last: "Bakare", email: "tunde@example.com", class: "SSS 1", status: "pending" },
      { first: "Amina", last: "Hassan", email: "amina@example.com", class: "JSS 2", status: "reviewed" },
      { first: "Obinna", last: "Uche", email: "obinna@example.com", class: "Primary 3", status: "admitted" },
      { first: "Sade", last: "Ogundimu", email: "sade@example.com", class: "JSS 3", status: "pending" },
    ];

    for (let i = 0; i < applicantDefs.length; i++) {
      const ad = applicantDefs[i];
      const appNum = `APP/${new Date().getFullYear()}/${(100 + i).toString().padStart(4, "0")}`;
      await prisma.applicant.upsert({
        where: { applicationNumber: appNum },
        update: {},
        create: {
          schoolId: school.id,
          applicationNumber: appNum,
          firstName: ad.first, lastName: ad.last, email: ad.email,
          phone: `+234801000000${i}`,
          dateOfBirth: new Date(`2012-0${(i % 9) + 1}-15`),
          gender: i % 2 === 0 ? "Female" : "Male",
          classAppliedFor: ad.class,
          status: ad.status,
          submittedAt: new Date(Date.now() - (i + 1) * 86400000 * 2),
          guardianName: `Guardian of ${ad.first}`,
          guardianPhone: `+234802000000${i}`,
          nationality: "Nigerian",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with comprehensive data",
      counts: {
        users: accounts.length,
        classes: classDefs.length,
        subjects: subjectDefs.length,
        students: students.length,
        fees: fees.length,
        applicants: applicantDefs.length,
      },
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seeding failed", details: error.message }, { status: 500 });
  }
}
