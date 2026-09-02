import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";
import { SCHOOL_CONFIG } from "@/lib/school-config";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: SCHOOL_CONFIG.name,
    template: `%s | ${SCHOOL_CONFIG.name}`,
  },
  description: `Excellence, Discipline, Integrity - ${SCHOOL_CONFIG.name} Management Portal`,
  keywords: [
    SCHOOL_CONFIG.name,
    "school portal",
    "student management",
    "education",
    "ERP",
    "Lagos",
  ],
  authors: [{ name: SCHOOL_CONFIG.name }],
  creator: SCHOOL_CONFIG.name,
  publisher: SCHOOL_CONFIG.name,
  metadataBase: new URL(SCHOOL_CONFIG.website),
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/og-image.png", type: "image/png", sizes: "512x512" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SCHOOL_CONFIG.website,
    siteName: SCHOOL_CONFIG.name,
    title: SCHOOL_CONFIG.name,
    description: `Excellence, Discipline, Integrity - ${SCHOOL_CONFIG.name} Management Portal`,
    images: [
      {
        url: "/og-image.png",
        width: 512,
        height: 512,
        alt: SCHOOL_CONFIG.name,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SCHOOL_CONFIG.name,
    description: `Excellence, Discipline, Integrity - ${SCHOOL_CONFIG.name} Management Portal`,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
