"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Download,
  Users,
  GraduationCap,
  UserCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  status: string;
  class: { displayName: string } | null;
  guardians: { firstName: string; lastName: string }[];
}

interface StudentsResponse {
  students: Student[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function StudentsPage() {
  const [data, setData] = useState<StudentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
    });
    if (search) params.set("search", search);
    if (selectedClass !== "all") params.set("classId", selectedClass);

    fetch(`/api/students?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setData({
          students: data.students ?? [],
          total: data.pagination?.total ?? 0,
          page: data.pagination?.page ?? 1,
          pageSize: data.pagination?.limit ?? 10,
          totalPages: data.pagination?.pages ?? 1,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, selectedClass]);

  const stats = [
    { label: "Total Students", value: data?.total ?? 0, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Active Students", value: data?.students?.filter((s) => s.status === "active").length ?? 0, icon: UserCheck, color: "from-emerald-500 to-emerald-600" },
    { label: "Male Students", value: data?.students?.filter((s) => s.gender === "Male").length ?? 0, icon: GraduationCap, color: "from-purple-500 to-purple-600" },
    { label: "Female Students", value: data?.students?.filter((s) => s.gender === "Female").length ?? 0, icon: GraduationCap, color: "from-pink-500 to-pink-600" },
  ];

  const columns = [
    {
      key: "name",
      label: "Student",
      render: (row: Student) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
            {row.firstName[0]}{row.lastName[0]}
          </div>
          <span className="text-white font-medium">{row.firstName} {row.lastName}</span>
        </div>
      ),
    },
    { key: "admissionNumber", label: "Admission No." },
    {
      key: "class",
      label: "Class",
      render: (row: Student) => row.class?.displayName ?? "Unassigned",
    },
    { key: "gender", label: "Gender" },
    {
      key: "guardian",
      label: "Guardian",
      render: (row: Student) =>
        row.guardians?.[0] ? `${row.guardians[0].firstName} ${row.guardians[0].lastName}` : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (row: Student) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.status === "active"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (row: Student) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/dashboard/students/${row.id}`}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            View
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Student Management</h2>
          <p className="text-white/50 text-sm">
            Manage all student records, profiles, and academic information
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link
            href="/dashboard/students/new"
            className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{Number(stat.value).toLocaleString()}</p>
                <p className="text-white/40 text-xs">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              placeholder="Search by name, admission number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">All Classes</option>
          </select>
          <button className="px-4 py-3 rounded-xl glass border border-white/20 text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </motion.div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card overflow-hidden"
      >
        <div className="p-4">
          <DataTable
            columns={columns}
            data={data?.students ?? []}
            loading={loading}
            searchable={false}
            pagination={false}
            emptyMessage="No students found"
          />
        </div>
        {/* Manual pagination synced to API */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <p className="text-white/40 text-sm">
              Showing {(data.page - 1) * data.pageSize + 1}–
              {Math.min(data.page * data.pageSize, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-all disabled:opacity-30"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      page === pageNum
                        ? "bg-[var(--primary)] text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-all disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
