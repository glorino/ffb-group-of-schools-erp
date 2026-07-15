"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjQ.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjQ.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjQ.woff2", fontWeight: 700 },
  ],
});

const COLORS = {
  primary: "#1e3a8a",
  primaryLight: "#2563eb",
  accent: "#dbeafe",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  text: "#1e293b",
  textLight: "#64748b",
  background: "#f8fafc",
  border: "#e2e8f0",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 10,
    color: COLORS.text,
    padding: 0,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.white,
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 9,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.4,
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.white,
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: "6px 16px",
    borderRadius: 4,
    marginTop: 8,
  },
  studentInfoSection: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  studentInfoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  studentInfoItem: {
    width: "30%",
  },
  studentLabel: {
    fontSize: 8,
    color: COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  studentValue: {
    fontSize: 10,
    fontWeight: 600,
    color: COLORS.text,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.primary,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  table: {
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    padding: 6,
    borderRadius: 4,
  },
  tableHeaderCell: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: 600,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: 6,
    backgroundColor: COLORS.background,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  tableCell: {
    fontSize: 9,
    textAlign: "center",
  },
  subjectCell: {
    fontSize: 9,
    textAlign: "left",
    flex: 2,
  },
  numberCell: {
    fontSize: 9,
    textAlign: "center",
    flex: 1,
  },
  attendanceGrid: {
    flexDirection: "row",
    gap: 12,
  },
  attendanceCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  attendanceNumber: {
    fontSize: 20,
    fontWeight: 700,
    color: COLORS.primary,
  },
  attendanceLabel: {
    fontSize: 8,
    color: COLORS.textLight,
    marginTop: 2,
  },
  behaviourRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  behaviourLabel: {
    fontSize: 9,
    color: COLORS.textLight,
    flex: 2,
  },
  behaviourValue: {
    fontSize: 9,
    fontWeight: 600,
    textAlign: "right",
    flex: 1,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginTop: 8,
  },
  signatureBox: {
    width: "40%",
    alignItems: "center",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: COLORS.text,
    width: "100%",
    marginTop: 40,
    paddingTop: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: COLORS.textLight,
    marginTop: 4,
  },
  qrSection: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  qrPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  qrText: {
    fontSize: 6,
    color: COLORS.textLight,
    textAlign: "center",
  },
  footer: {
    backgroundColor: COLORS.primary,
    padding: 12,
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "rgba(255,255,255,0.8)",
  },
  remarksSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  remarksGrid: {
    flexDirection: "row",
    gap: 16,
  },
  remarksCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  remarksLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: COLORS.primary,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  remarksValue: {
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.4,
  },
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
  const caTotal = grades.reduce((sum, g) => sum + g.ca1 + g.ca2 + g.ca3, 0);
  const examTotal = grades.reduce((sum, g) => sum + g.exam, 0);
  const overallTotal = grades.reduce((sum, g) => sum + g.total, 0);
  const average =
    grades.length > 0 ? Math.round(overallTotal / grades.length) : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.schoolName}>{school.name}</Text>
            {school.address && (
              <Text style={styles.schoolAddress}>{school.address}</Text>
            )}
          </View>
          <View>
            <Text style={styles.reportTitle}>
              STUDENT REPORT CARD
            </Text>
          </View>
        </View>

        <View style={styles.studentInfoSection}>
          <View style={styles.studentInfoGrid}>
            <View style={styles.studentInfoItem}>
              <Text style={styles.studentLabel}>Student Name</Text>
              <Text style={styles.studentValue}>{studentData.name}</Text>
            </View>
            <View style={styles.studentInfoItem}>
              <Text style={styles.studentLabel}>Admission No.</Text>
              <Text style={styles.studentValue}>
                {studentData.admissionNumber}
              </Text>
            </View>
            <View style={styles.studentInfoItem}>
              <Text style={styles.studentLabel}>Class</Text>
              <Text style={styles.studentValue}>{studentData.className}</Text>
            </View>
          </View>
          <View
            style={[
              styles.studentInfoGrid,
              { marginTop: 8 },
            ]}
          >
            <View style={styles.studentInfoItem}>
              <Text style={styles.studentLabel}>Term</Text>
              <Text style={styles.studentValue}>{termData.name}</Text>
            </View>
            <View style={styles.studentInfoItem}>
              <Text style={styles.studentLabel}>Academic Year</Text>
              <Text style={styles.studentValue}>{termData.academicYear}</Text>
            </View>
            {position != null && classSize != null && (
              <View style={styles.studentInfoItem}>
                <Text style={styles.studentLabel}>Class Position</Text>
                <Text style={styles.studentValue}>
                  {position}
                  {position === 1
                    ? "st"
                    : position === 2
                      ? "nd"
                      : position === 3
                        ? "rd"
                        : "th"}{" "}
                  of {classSize}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Results</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: "left" }]}>
                Subject
              </Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>CA1</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>CA2</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>CA3</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Exam</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Total</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Grade</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Remark</Text>
            </View>
            {grades.map((grade, index) => (
              <View
                key={`${grade.subjectCode}-${index}`}
                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={[styles.tableCell, styles.subjectCell]}>
                  {grade.subject}
                </Text>
                <Text style={[styles.tableCell, styles.numberCell]}>
                  {grade.ca1}
                </Text>
                <Text style={[styles.tableCell, styles.numberCell]}>
                  {grade.ca2}
                </Text>
                <Text style={[styles.tableCell, styles.numberCell]}>
                  {grade.ca3}
                </Text>
                <Text style={[styles.tableCell, styles.numberCell]}>
                  {grade.exam}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.numberCell,
                    { fontWeight: 700 },
                  ]}
                >
                  {grade.total}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.numberCell,
                    { fontWeight: 700 },
                  ]}
                >
                  {grade.grade}
                </Text>
                <Text
                  style={[styles.tableCell, styles.numberCell, { fontSize: 8 }]}
                >
                  {grade.remark}
                </Text>
              </View>
            ))}
            <View style={[styles.tableRow, { backgroundColor: COLORS.accent }]}>
              <Text
                style={[
                  styles.tableCell,
                  styles.subjectCell,
                  { fontWeight: 700 },
                ]}
              >
                TOTAL
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.numberCell,
                  { fontWeight: 700 },
                ]}
              >
                {caTotal}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.numberCell,
                  { fontWeight: 700 },
                ]}
              >
                -
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.numberCell,
                  { fontWeight: 700 },
                ]}
              >
                -
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.numberCell,
                  { fontWeight: 700 },
                ]}
              >
                {examTotal}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.numberCell,
                  { fontWeight: 700 },
                ]}
              >
                {overallTotal}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.numberCell,
                  { fontWeight: 700 },
                ]}
              >
                -
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.numberCell,
                  { fontWeight: 700 },
                  { fontSize: 9 },
                ]}
              >
                Avg: {average}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance Summary</Text>
          <View style={styles.attendanceGrid}>
            <View style={styles.attendanceCard}>
              <Text style={styles.attendanceNumber}>
                {attendance.totalDays}
              </Text>
              <Text style={styles.attendanceLabel}>School Days</Text>
            </View>
            <View style={styles.attendanceCard}>
              <Text
                style={[
                  styles.attendanceNumber,
                  { color: COLORS.success },
                ]}
              >
                {attendance.present}
              </Text>
              <Text style={styles.attendanceLabel}>Days Present</Text>
            </View>
            <View style={styles.attendanceCard}>
              <Text
                style={[
                  styles.attendanceNumber,
                  { color: COLORS.danger },
                ]}
              >
                {attendance.absent}
              </Text>
              <Text style={styles.attendanceLabel}>Days Absent</Text>
            </View>
            <View style={styles.attendanceCard}>
              <Text
                style={[
                  styles.attendanceNumber,
                  { color: COLORS.warning },
                ]}
              >
                {attendance.totalDays > 0
                  ? `${Math.round((attendance.present / attendance.totalDays) * 100)}%`
                  : "0%"}
              </Text>
              <Text style={styles.attendanceLabel}>Attendance Rate</Text>
            </View>
          </View>
        </View>

        {behaviour && Object.keys(behaviour).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Behaviour Assessment</Text>
            {Object.entries(behaviour).map(([key, value]) => (
              <View key={key} style={styles.behaviourRow}>
                <Text style={styles.behaviourLabel}>{key}</Text>
                <Text style={styles.behaviourValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        {psychomotor && Object.keys(psychomotor).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Psychomotor Skills</Text>
            {Object.entries(psychomotor).map(([key, value]) => (
              <View key={key} style={styles.behaviourRow}>
                <Text style={styles.behaviourLabel}>{key}</Text>
                <Text style={styles.behaviourValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        {(teacherComment || principalComment) && (
          <View style={styles.remarksSection}>
            <Text style={styles.sectionTitle}>Remarks</Text>
            <View style={styles.remarksGrid}>
              {teacherComment && (
                <View style={styles.remarksCard}>
                  <Text style={styles.remarksLabel}>Class Teacher&apos;s Remark</Text>
                  <Text style={styles.remarksValue}>{teacherComment}</Text>
                </View>
              )}
              {principalComment && (
                <View style={styles.remarksCard}>
                  <Text style={styles.remarksLabel}>Principal&apos;s Remark</Text>
                  <Text style={styles.remarksValue}>{principalComment}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Class Teacher&apos;s Signature</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Principal&apos;s Signature</Text>
          </View>
        </View>

        <View style={styles.qrSection}>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrText}>QR Code{"\n"}Verification</Text>
          </View>
          <Text style={styles.qrText}>
            Scan to verify this report card
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} {school.name}. All rights reserved.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
