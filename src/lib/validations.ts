import { z } from "zod";

export const StudentCreateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"]),
  bloodGroup: z.string().optional(),
  nationality: z.string().default("Nigerian"),
  stateOfOrigin: z.string().optional(),
  lga: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  classId: z.string().optional(),
  schoolId: z.string().min(1, "School is required"),
  guardian: z
    .object({
      firstName: z.string().min(1, "Guardian first name is required"),
      lastName: z.string().min(1, "Guardian last name is required"),
      relationship: z.string().min(1, "Relationship is required"),
      phone: z.string().min(1, "Guardian phone is required"),
      email: z.string().email("Invalid email").optional().or(z.literal("")),
      address: z.string().optional(),
      occupation: z.string().optional(),
      isPrimary: z.boolean().default(true),
    })
    .optional(),
});

export const TeacherCreateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  schoolId: z.string().min(1, "School is required"),
  subjectIds: z.array(z.string()).optional(),
});

export const AdmissionSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"]),
  classAppliedFor: z.string().min(1, "Class is required"),
  previousSchool: z.string().optional(),
  schoolId: z.string().min(1, "School is required"),
  guardianName: z.string().min(1, "Guardian name is required"),
  guardianPhone: z.string().min(1, "Guardian phone is required"),
  guardianEmail: z.string().optional(),
  guardianRelationship: z.string().min(1, "Relationship is required"),
  address: z.string().optional(),
  nationality: z.string().optional(),
  stateOfOrigin: z.string().optional(),
  bloodGroup: z.string().optional(),
});

export const AttendanceSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  classId: z.string().optional(),
  termId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  session: z.enum(["morning", "afternoon"]).default("morning"),
  status: z.enum(["present", "absent", "late", "excused"]),
  notes: z.string().optional(),
});

export const AttendanceBulkSchema = z.object({
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["present", "absent", "late", "excused"]),
      notes: z.string().optional(),
    })
  ),
  classId: z.string().min(1, "Class is required"),
  date: z.string().min(1, "Date is required"),
  session: z.enum(["morning", "afternoon"]).default("morning"),
  termId: z.string().optional(),
});

export const PaymentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  invoiceId: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["cash", "bank_transfer", "card", "online", "flutterwave"]),
  reference: z.string().optional(),
  description: z.string().optional(),
});

export const FeeSchema = z.object({
  name: z.string().min(1, "Fee name is required"),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  classId: z.string().optional(),
  type: z
    .enum(["tuition", "development", "uniform", "transport", "hostel", "exam", "other"])
    .default("tuition"),
  term: z.string().optional(),
  academicYear: z.string().optional(),
  isMandatory: z.boolean().default(true),
  schoolId: z.string().min(1, "School is required"),
});

export const InvoiceSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  schoolFeeId: z.string().min(1, "Fee type is required"),
  amount: z.number().positive("Amount must be positive"),
  discount: z.number().min(0).optional(),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
});

export const NotificationSchema = z.object({
  userId: z.string().min(1, "User is required"),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["info", "success", "warning", "error"]).default("info"),
  module: z.string().optional(),
  link: z.string().optional(),
});
