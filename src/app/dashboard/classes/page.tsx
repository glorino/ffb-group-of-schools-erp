"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Building,
  UserCheck,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";

const classes = [
  { id: 1, name: "JSS1", arm: "A", students: 42, capacity: 45, teacher: "Mrs. Adaeze Okonkwo", stream: "Science", status: "active" },
  { id: 2, name: "JSS1", arm: "B", students: 38, capacity: 45, teacher: "Mr. Emeka Nwosu", stream: "Arts", status: "active" },
  { id: 3, name: "JSS2", arm: "A", students: 40, capacity: 45, teacher: "Mrs. Fatima Abubakar", stream: "Science", status: "active" },
  { id: 4, name: "JSS3", arm: "A", students: 35, capacity: 40, teacher: "Mr. Olusegun Adeyemi", stream: "Commercial", status: "active" },
  { id: 5, name: "SS1", arm: "A", students: 28, capacity: 35, teacher: "Mrs. Ngozi Okwu", stream: "Science", status: "active" },
  { id: 6, name: "SS1", arm: "B", students: 30, capacity: 35, teacher: "Mr. Chinedu Obi", stream: "Arts", status: "active" },
  { id: 7, name: "SS2", arm: "A", students: 25, capacity: 30, teacher: "Mrs. Aisha Bello", stream: "Science", status: "active" },
  { id: 8, name: "SS3", arm: "A", students: 22, capacity: 30, teacher: "Mr. Tunde Adekunle", stream: "Science", status: "active" },
];

const streams = [
  { name: "Science", count: 3, color: "from-blue-500 to-blue-600" },
  { name: "Arts", count: 2, color: "from-purple-500 to-purple-600" },
  { name: "Commercial", count: 1, color: "from-orange-500 to-orange-600" },
];

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Class Management</h1>
            <p className="text-white/60">
              Manage classes, streams, arms, and teacher assignments across all levels
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" />
            Add Class
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Classes", value: "18", icon: Building, color: "from-blue-500 to-blue-600" },
          { label: "Total Students", value: "2847", icon: Users, color: "from-emerald-500 to-emerald-600" },
          { label: "Active Teachers", value: "156", icon: UserCheck, color: "from-purple-500 to-purple-600" },
          { label: "Avg. Class Size", value: "38", icon: GraduationCap, color: "from-[var(--accent)] to-emerald-400" },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">{kpi.label}</p>
                <p className="text-3xl font-bold text-white">{kpi.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">All Classes</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Class</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Arm</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Stream</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Teacher</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Students</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Capacity</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="py-3 text-white font-medium">{cls.name}</td>
                    <td className="py-3 text-white/70">{cls.arm}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-lg bg-white/10 text-white/70 text-xs">{cls.stream}</span>
                    </td>
                    <td className="py-3 text-white/70 text-sm">{cls.teacher}</td>
                    <td className="py-3 text-white/70">{cls.students}/{cls.capacity}</td>
                    <td className="py-3">
                      <div className="w-full bg-white/10 rounded-full h-2 max-w-[80px]">
                        <div
                          className="bg-[var(--accent)] h-2 rounded-full"
                          style={{ width: `${(cls.students / cls.capacity) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3">
                      <button className="p-1 rounded-lg hover:bg-white/10 text-white/40">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-white font-semibold text-lg mb-4">Streams</h3>
          <div className="space-y-3">
            {streams.map((stream, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">{stream.name}</span>
                  <span className="text-white/40 text-sm">{stream.count} classes</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-white/60 text-sm mb-3">Capacity Overview</h4>
            <div className="space-y-2">
              {classes.slice(0, 4).map((cls) => (
                <div key={cls.id} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{cls.name}{cls.arm}</span>
                  <span className="text-white/40">{Math.round((cls.students / cls.capacity) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
