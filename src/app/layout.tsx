import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FFB Group of Schools",
  description:
    "Excellence, Discipline, Integrity - FFB Group of Schools Management Portal",
  keywords: [
    "FFB Group of Schools",
    "school portal",
    "student management",
    "education",
  ],
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${jakarta.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              theme="dark"
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
