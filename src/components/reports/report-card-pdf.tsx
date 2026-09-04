"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

let fontsRegistered = false;

function ensureFontsRegistered() {
  if (fontsRegistered) return;
  fontsRegistered = true;
  Font.register({
    family: "Inter",
    fonts: [
      { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjQ.woff2", fontWeight: 400 },
      { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjQ.woff2", fontWeight: 600 },
      { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjQ.woff2", fontWeight: 700 },
    ],
  });
}

const C = {
  primary: "#1e3a8a",
  accent: "#dbeafe",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  text: "#1e293b",
  textLight: "#64748b",
  bg: "#f8fafc",
  border: "#e2e8f0",
  white: "#ffffff",
};

const s = StyleSheet.create({
  page: { fontFamily: "Inter", fontSize: 9, color: C.text, padding: 0, position: "relative" },

  watermark: { position: "absolute", top: "30%", left: "15%", width: "70%", height: "40%", opacity: 0.04, objectFit: "contain" },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "16 24", borderBottomWidth: 2, borderBottomColor: C.primary },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  logo: { width: 48, height: 48, borderRadius: 6 },
  schoolInfo: { flex: 1 },
  schoolName: { fontSize: 16, fontWeight: 700, color: C.primary },
  schoolSub: { fontSize: 8, color: C.textLight, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  reportBadge: { backgroundColor: C.primary, padding: "4 12", borderRadius: 4 },
  reportBadgeText: { fontSize: 8, fontWeight: 700, color: C.white, textTransform: "uppercase", letterSpacing: 0.5 },
  generatedDate: { fontSize: 7, color: C.textLight, marginTop: 4 },

  studentBar: { flexDirection: "row", padding: "10 24", backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.border, gap: 24 },
  studentBarItem: {},
  studentBarLabel: { fontSize: 7, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 1 },
  studentBarValue: { fontSize: 10, fontWeight: 700, color: C.text },

  section: { padding: "10 24" },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: C.primary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5, borderBottomWidth: 1, borderBottomColor: C.accent, paddingBottom: 4 },

  table: { marginBottom: 4 },
  tableHeader: { flexDirection: "row", backgroundColor: C.primary, padding: "5 0" },
  th: { color: C.white, fontSize: 7, fontWeight: 700, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.3 },
  thLeft: { textAlign: "left", paddingLeft: 6, flex: 2.5 },
  thNum: { flex: 1 },

  tableRow: { flexDirection: "row", padding: "5 0", borderBottomWidth: 0.5, borderBottomColor: C.border, alignItems: "center" },
  tableRowAlt: { flexDirection: "row", padding: "5 0", backgroundColor: "#f1f5f9", borderBottomWidth: 0.5, borderBottomColor: C.border, alignItems: "center" },
  td: { fontSize: 8, textAlign: "center" },
  tdLeft: { textAlign: "left", paddingLeft: 6, flex: 2.5, fontSize: 8, fontWeight: 600 },
  tdNum: { flex: 1 },
  tdBold: { fontWeight: 700 },

  tableTotal: { flexDirection: "row", padding: "6 0", backgroundColor: C.accent, borderTopWidth: 1, borderTopColor: C.primary },
  tdTotalLabel: { flex: 2.5, paddingLeft: 6, fontSize: 8, fontWeight: 700, color: C.primary },
  tdTotalNum: { flex: 1, fontSize: 8, fontWeight: 700, textAlign: "center" },

  statsRow: { flexDirection: "row", gap: 12, marginTop: 6, marginBottom: 4 },
  statCard: { flex: 1, padding: "6 8", backgroundColor: C.bg, borderRadius: 4, borderWidth: 0.5, borderColor: C.border, alignItems: "center" },
  statNum: { fontSize: 14, fontWeight: 700, color: C.primary },
  statLabel: { fontSize: 6, color: C.textLight, marginTop: 1, textTransform: "uppercase" },

  commentsSection: { padding: "8 24" },
  commentsGrid: { flexDirection: "row", gap: 12 },
  commentCard: { flex: 1, padding: 8, backgroundColor: C.bg, borderRadius: 4, borderWidth: 0.5, borderColor: C.border },
  commentLabel: { fontSize: 7, fontWeight: 700, color: C.primary, marginBottom: 4, textTransform: "uppercase" },
  commentText: { fontSize: 8, lineHeight: 1.4, color: C.text },

  sigSection: { flexDirection: "row", justifyContent: "space-between", padding: "16 40", marginTop: 6 },
  sigBox: { width: "35%", alignItems: "center" },
  sigLine: { borderTopWidth: 0.5, borderTopColor: C.text, width: "100%", marginTop: 30, paddingTop: 3 },
  sigLabel: { fontSize: 7, color: C.textLight, marginTop: 3, textAlign: "center" },

  footer: { padding: "8 24", borderTopWidth: 1, borderTopColor: C.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: "auto" },
  footerText: { fontSize: 6, color: C.textLight },
  footerMotto: { fontSize: 7, fontWeight: 600, color: C.primary, fontStyle: "italic" },
});

export interface SubjectGrade {
  subject: string;
  subjectCode: string;
  teacher: string;
  ca1: number;
  ca2: number;
  ca3: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

export interface StudentData {
  id: string;
  name: string;
  admissionNumber: string;
  className: string;
  photo?: string | null;
  qrCode?: string | null;
}

export interface TermData {
  id: string;
  name: string;
  academicYear: string;
}

export interface Attendance {
  totalDays: number;
  present: number;
  absent: number;
}

export interface GradingScaleEntry {
  name: string;
  minScore: number;
  maxScore: number;
  grade: string;
  remark: string;
}

export interface ReportCardProps {
  studentData: StudentData;
  termData: TermData;
  school: {
    name: string;
    address?: string | null;
    logo?: string | null;
    phone?: string | null;
    email?: string | null;
    motto?: string | null;
    principalSignature?: string | null;
  };
  grades: SubjectGrade[];
  gradingScale: GradingScaleEntry[];
  attendance: Attendance;
  behaviour?: Record<string, string> | null;
  psychomotor?: Record<string, string> | null;
  teacherComment?: string | null;
  principalComment?: string | null;
  classTeacher?: string | null;
  position?: number | null;
  classSize?: number | null;
}

export function ReportCardPDF({
  studentData,
  termData,
  school,
  grades,
  attendance,
  behaviour,
  psychomotor,
  teacherComment,
  principalComment,
  classTeacher,
  position,
  classSize,
}: ReportCardProps) {
  ensureFontsRegistered();

  const caTotal = grades.reduce((sum, g) => sum + g.ca1 + g.ca2 + g.ca3, 0);
  const examTotal = grades.reduce((sum, g) => sum + g.exam, 0);
  const overallTotal = grades.reduce((sum, g) => sum + g.total, 0);
  const average = grades.length > 0 ? Math.round(overallTotal / grades.length) : 0;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {school.logo && <Image src={school.logo} style={s.watermark} />}

        <View style={s.header}>
          <View style={s.headerLeft}>
            {school.logo && <Image src={school.logo} style={s.logo} />}
            <View style={s.schoolInfo}>
              <Text style={s.schoolName}>{school.name}</Text>
              {school.address && <Text style={s.schoolSub}>{school.address}</Text>}
              {(school.phone || school.email) && (
                <Text style={s.schoolSub}>
                  {school.phone ? `Tel: ${school.phone}` : ""}
                  {school.phone && school.email ? "  |  " : ""}
                  {school.email ? `Email: ${school.email}` : ""}
                </Text>
              )}
            </View>
          </View>
          <View style={s.headerRight}>
            <View style={s.reportBadge}>
              <Text style={s.reportBadgeText}>Report Card</Text>
            </View>
            <Text style={s.generatedDate}>Generated: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}</Text>
          </View>
        </View>

        <View style={s.studentBar}>
          <View style={s.studentBarItem}>
            <Text style={s.studentBarLabel}>Student Name</Text>
            <Text style={s.studentBarValue}>{studentData.name}</Text>
          </View>
          <View style={s.studentBarItem}>
            <Text style={s.studentBarLabel}>Admission No.</Text>
            <Text style={s.studentBarValue}>{studentData.admissionNumber}</Text>
          </View>
          <View style={s.studentBarItem}>
            <Text style={s.studentBarLabel}>Class</Text>
            <Text style={s.studentBarValue}>{studentData.className}</Text>
          </View>
          <View style={s.studentBarItem}>
            <Text style={s.studentBarLabel}>Term</Text>
            <Text style={s.studentBarValue}>{termData.name}</Text>
          </View>
          <View style={s.studentBarItem}>
            <Text style={s.studentBarLabel}>Session</Text>
            <Text style={s.studentBarValue}>{termData.academicYear}</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Academic Results</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={[s.th, s.thLeft]}>Subject</Text>
              <Text style={[s.th, s.thNum]}>CA1</Text>
              <Text style={[s.th, s.thNum]}>CA2</Text>
              <Text style={[s.th, s.thNum]}>CA3</Text>
              <Text style={[s.th, s.thNum]}>Exam</Text>
              <Text style={[s.th, s.thNum]}>Total</Text>
              <Text style={[s.th, s.thNum]}>Grade</Text>
            </View>
            {grades.map((grade, i) => {
              const rowStyle = i % 2 === 0 ? s.tableRow : s.tableRowAlt;
              return (
                <View key={`${grade.subjectCode}-${i}`} style={rowStyle}>
                  <Text style={s.tdLeft}>{grade.subject}</Text>
                  <Text style={[s.td, s.tdNum]}>{grade.ca1}</Text>
                  <Text style={[s.td, s.tdNum]}>{grade.ca2}</Text>
                  <Text style={[s.td, s.tdNum]}>{grade.ca3}</Text>
                  <Text style={[s.td, s.tdNum]}>{grade.exam}</Text>
                  <Text style={[s.td, s.tdNum, s.tdBold]}>{grade.total}</Text>
                  <Text style={[s.td, s.tdNum, s.tdBold]}>{grade.grade}</Text>
                </View>
              );
            })}
            <View style={s.tableTotal}>
              <Text style={s.tdTotalLabel}>TOTAL / AVERAGE</Text>
              <Text style={s.tdTotalNum}>{caTotal}</Text>
              <Text style={s.tdTotalNum}>-</Text>
              <Text style={s.tdTotalNum}>-</Text>
              <Text style={s.tdTotalNum}>{examTotal}</Text>
              <Text style={s.tdTotalNum}>{overallTotal}</Text>
              <Text style={[s.tdTotalNum, { color: C.primary }]}>{average}%</Text>
            </View>
          </View>
        </View>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNum}>{grades.length}</Text>
            <Text style={s.statLabel}>Total Subjects</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>{average}%</Text>
            <Text style={s.statLabel}>Average Score</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>{attendance.present}/{attendance.totalDays}</Text>
            <Text style={s.statLabel}>Attendance</Text>
          </View>
          {position != null && classSize != null && (
            <View style={s.statCard}>
              <Text style={s.statNum}>{position}{position === 1 ? "st" : position === 2 ? "nd" : position === 3 ? "rd" : "th"}</Text>
              <Text style={s.statLabel}>Position of {classSize}</Text>
            </View>
          )}
        </View>

        {(teacherComment || principalComment) && (
          <View style={s.commentsSection}>
            <View style={s.commentsGrid}>
              {teacherComment && (
                <View style={s.commentCard}>
                  <Text style={s.commentLabel}>Class Teacher&apos;s Remark</Text>
                  <Text style={s.commentText}>{teacherComment}</Text>
                </View>
              )}
              {principalComment && (
                <View style={s.commentCard}>
                  <Text style={s.commentLabel}>Principal&apos;s Remark</Text>
                  <Text style={s.commentText}>{principalComment}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={s.sigSection}>
          <View style={s.sigBox}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Class Teacher&apos;s Signature & Stamp</Text>
          </View>
          <View style={s.sigBox}>
            {school.principalSignature ? (
              <Image src={school.principalSignature} style={{ width: 100, height: 30, objectFit: "contain", marginBottom: 4 }} />
            ) : (
              <View style={s.sigLine} />
            )}
            <Text style={s.sigLabel}>Principal&apos;s Signature & Stamp</Text>
          </View>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>
            {school.phone ? `Tel: ${school.phone}` : ""} {school.email ? `| Email: ${school.email}` : ""}
          </Text>
          <Text style={s.footerMotto}>{school.motto || ""}</Text>
          <Text style={s.footerText}>Report Card ID: RC-{Date.now().toString(36).toUpperCase()}</Text>
        </View>
      </Page>
    </Document>
  );
}
