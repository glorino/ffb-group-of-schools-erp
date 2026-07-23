import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
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
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body
        className={`${poppins.variable} antialiased`}
        style={{ fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}
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
