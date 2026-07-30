export const SCHOOL_CONFIG = {
  name: "FFB Group of Schools",
  motto: "Knowledge, Excellence, Integrity",
  address: "123 Education Avenue, GRA, Lagos State, Nigeria",
  phone: "+234 905 998 0991",
  email: "info@ffb.edu.ng",
  website: process.env.NEXT_PUBLIC_APP_URL || "https://ffb-erp.vercel.app",
  city: "Lagos",
  state: "Lagos",
  country: "Nigeria",
  currency: "NGN",
  currencySymbol: "\u20A6",
  timezone: "Africa/Lagos",
  workingHours: "Mon - Fri: 7:30 AM - 4:00 PM",
  googleMapsQuery: "Lagos+Nigeria",
  latePenaltyPerDay: Number(process.env.NEXT_PUBLIC_LATE_PENALTY_PER_DAY) || 100,
} as const;

export function formatCurrency(amount: number): string {
  return `${SCHOOL_CONFIG.currencySymbol}${amount.toLocaleString()}`;
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000) return `${SCHOOL_CONFIG.currencySymbol}${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${SCHOOL_CONFIG.currencySymbol}${(amount / 1000).toFixed(0)}K`;
  return `${SCHOOL_CONFIG.currencySymbol}${amount.toLocaleString()}`;
}
