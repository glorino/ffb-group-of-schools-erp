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
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
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

export const ExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export const IncomeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().optional(),
});

export const GuardianSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  occupation: z.string().optional(),
  isPrimary: z.boolean().default(true),
});

export const HostelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  capacity: z.number().int().positive("Capacity must be positive"),
  description: z.string().optional(),
  gender: z.enum(["male", "female", "mixed"]).optional(),
});

export const HostelVisitorSchema = z.object({
  hostelId: z.string().min(1, "Hostel is required"),
  studentId: z.string().min(1, "Student is required"),
  visitorName: z.string().min(1, "Visitor name is required"),
  visitorPhone: z.string().min(1, "Visitor phone is required"),
  relationship: z.string().min(1, "Relationship is required"),
  purpose: z.string().optional(),
});

export const LibraryBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  totalCopies: z.number().int().positive("Copies must be positive").default(1),
  availableCopies: z.number().int().min(0).optional(),
  description: z.string().optional(),
  shelfLocation: z.string().optional(),
});

export const LibraryBorrowingSchema = z.object({
  bookId: z.string().min(1, "Book is required"),
  studentId: z.string().min(1, "Student is required"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
});

export const DisciplineSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  type: z.enum(["behavioral", "academic", "attendance", "other"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  action: z.string().optional(),
  date: z.string().optional(),
});

export const LessonPlanSchema = z.object({
  teacherId: z.string().min(1, "Teacher is required"),
  subject: z.string().min(1, "Subject is required"),
  classId: z.string().min(1, "Class is required"),
  title: z.string().min(1, "Title is required"),
  objective: z.string().min(1, "Objective is required"),
  content: z.string().min(1, "Content is required"),
  activities: z.string().optional(),
  assessment: z.string().optional(),
  date: z.string().optional(),
  duration: z.string().optional(),
});

export const ClinicVisitSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  reason: z.string().min(1, "Reason is required"),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
  temperature: z.string().optional(),
  bloodPressure: z.string().optional(),
});

export const InventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
  unitPrice: z.number().min(0, "Price must be non-negative").optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  supplier: z.string().optional(),
  reorderLevel: z.number().int().min(0).optional(),
});

export const AnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  targetAudience: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  expiresAt: z.string().optional(),
});

export const SubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  department: z.string().optional(),
});

export const ExamSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  term: z.string().optional(),
  type: z.enum(["midterm", "final", "continuous", "other"]).optional(),
});

export const GradeSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  subjectId: z.string().min(1, "Subject is required"),
  examId: z.string().min(1, "Exam is required"),
  score: z.number().min(0, "Score must be non-negative").max(100, "Score must be at most 100"),
  grade: z.string().optional(),
  comment: z.string().optional(),
});

export const TimetableEntrySchema = z.object({
  classId: z.string().min(1, "Class is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  subjectId: z.string().min(1, "Subject is required"),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  room: z.string().optional(),
});

export const TransportVehicleSchema = z.object({
  name: z.string().min(1, "Vehicle name is required"),
  plateNumber: z.string().min(1, "Plate number is required"),
  type: z.string().min(1, "Vehicle type is required"),
  capacity: z.number().int().positive("Capacity must be positive"),
  driverName: z.string().min(1, "Driver name is required"),
  driverPhone: z.string().min(1, "Driver phone is required"),
});

export const CalendarEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  start: z.string().min(1, "Start date is required"),
  end: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["academic", "event", "holiday", "exam", "other"]).default("event"),
  allDay: z.boolean().default(false),
});

export const PayrollSchema = z.object({
  teacherId: z.string().min(1, "Teacher is required"),
  month: z.string().min(1, "Month is required"),
  year: z.number().int().positive("Year is required"),
  baseSalary: z.number().positive("Base salary must be positive"),
  allowances: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  bonus: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export const AlumniSchema = z.object({
  userId: z.string().min(1, "User is required"),
  graduationYear: z.number().int().positive("Graduation year is required"),
  department: z.string().optional(),
  achievement: z.string().optional(),
  currentOccupation: z.string().optional(),
  company: z.string().optional(),
});

export const AlumniDonationSchema = z.object({
  alumniId: z.string().min(1, "Alumni is required"),
  amount: z.number().positive("Amount must be positive"),
  purpose: z.string().optional(),
  method: z.string().optional(),
});

export const UserCreateSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  schoolId: z.string().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().min(1, "Role is required"),
  phone: z.string().optional(),
  schoolId: z.string().optional(),
});
