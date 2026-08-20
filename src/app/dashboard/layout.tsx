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
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#e2e8f0] border-t-[var(--primary)] rounded-full animate-spin" />
          <p className="text-[#64748b] text-[12px]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <Sidebar />
      <div className="dashboard-main min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
