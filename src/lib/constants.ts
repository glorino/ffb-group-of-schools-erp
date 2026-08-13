export const GRADE_SCALE = [
  { grade: "A1", min: 75, max: 100, gpa: 4.0, label: "Excellent" },
  { grade: "B2", min: 70, max: 74, gpa: 3.5, label: "Very Good" },
  { grade: "B3", min: 65, max: 69, gpa: 3.0, label: "Good" },
  { grade: "C4", min: 60, max: 64, gpa: 2.5, label: "Credit" },
  { grade: "C5", min: 55, max: 59, gpa: 2.0, label: "Credit" },
  { grade: "C6", min: 50, max: 54, gpa: 1.5, label: "Credit" },
  { grade: "D7", min: 45, max: 49, gpa: 1.0, label: "Pass" },
  { grade: "E8", min: 40, max: 44, gpa: 0.5, label: "Pass" },
  { grade: "F9", min: 0, max: 39, gpa: 0.0, label: "Fail" },
];

export function getGrade(score: number): string {
  const found = GRADE_SCALE.find((g) => score >= g.min && score <= g.max);
  return found?.grade || "F9";
}

export function getGPA(score: number): number {
  const found = GRADE_SCALE.find((g) => score >= g.min && score <= g.max);
  return found?.gpa || 0.0;
}

export const CURRENCY = "NGN";
export const CURRENCY_SYMBOL = "\u20A6";

export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString("en-NG")}`;
}

export const DEFAULT_CLASS_CAPACITY = 40;

export const SCHOOL_TIMEZONE = "Africa/Lagos";

export const ACADEMIC_TERMS = ["First Term", "Second Term", "Third Term"] as const;

export type AcademicTerm = (typeof ACADEMIC_TERMS)[number];
