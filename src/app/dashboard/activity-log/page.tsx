"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Clock, User, Search, Loader2 } from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  module: string;
  userId: string;
  metadata: any;
  createdAt: string;
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/activity-log");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      console.error("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.module.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[#1a1a2e] text-xl font-bold">Activity Log</h1>
            <p className="text-[#64748b] text-[13px] mt-1">Track all system activities and changes</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#64748b]">
            <Activity className="w-12 h-12 mb-3 text-[#94a3b8]" />
            <p className="text-[13px]">No activity logs found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#f8fafc] hover:bg-white/[0.06] transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#dbeafe] text-[#2563eb]">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1a1a2e] text-[13px] font-medium">{log.action}</p>
                  <p className="text-[#64748b] text-[12px]">{log.module}</p>
                </div>
                <div className="flex items-center gap-2 text-[#94a3b8] text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(log.createdAt).toLocaleString("en-NG")}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
