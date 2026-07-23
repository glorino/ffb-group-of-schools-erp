"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ParticleBackground } from "@/components/particles";
import { canAccessRoute, getDefaultRoute } from "@/lib/rbac";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session) {
      const userRoles: string[] = (session.user as any)?.roles?.map((r: any) => r.name) || [];
      if (!canAccessRoute(pathname, userRoles)) {
        router.push(getDefaultRoute(userRoles));
      }
    }
  }, [status, session, pathname, router]);

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
      <div style={{ marginLeft: 240, width: "calc(100% - 240px)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1, padding: "28px 48px 48px 48px", overflowX: "hidden" }}>{children}</main>
      </div>
    </div>
  );
}
