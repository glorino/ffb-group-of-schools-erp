"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ParticleBackground } from "@/components/particles";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-animated flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-[var(--accent)] rounded-full animate-spin" />
          <p className="text-white/40 text-[12px]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-animated">
      <ParticleBackground />
      <Sidebar />
      <div className="relative z-10 min-h-screen flex flex-col" style={{ marginLeft: "240px" }}>
        <Header />
        <main className="flex-1 p-4 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
