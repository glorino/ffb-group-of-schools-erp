"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  UserCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";

const mockStudents = [
  {
    id: "1",
    admissionNo: "FFB/2024/0001",
    name: "Adebayo Johnson",
    class: "SS3 Science",
    gender: "Male",
    status: "active",
    photo: null,
    guardian: "Mr. Johnson",
    phone: "08012345678",
  },
  {
    id: "2",
    admissionNo: "FFB/2024/0002",
    name: "Chioma Okafor",
    class: "SS2 Arts",
    gender: "Female",
    status: "active",
    photo: null,
    guardian: "Mrs. Okafor",
    phone: "08098765432",
  },
  {
    id: "3",
    admissionNo: "FFB/2024/0003",
    name: "Ibrahim Mohammed",
    class: "JSS3",
    gender: "Male",
    status: "active",
    photo: null,
    guardian: "Mr. Mohammed",
    phone: "08055512345",
  },
  {
    id: "4",
    admissionNo: "FFB/2024/0004",
    name: "Fatima Abdullahi",
    class: "JSS2",
    gender: "Female",
    status: "active",
    photo: null,
    guardian: "Mr. Abdullahi",
    phone: "08066678901",
  },
  {
    id: "5",
    admissionNo: "FFB/2024/0005",
    name: "Emeka Nwankwo",
    class: "SS1 Commercial",
    gender: "Male",
    status: "inactive",
    photo: null,
    guardian: "Dr. Nwankwo",
    phone: "08077789012",
  },
  {
    id: "6",
    admissionNo: "FFB/2024/0006",
    name: "Aisha Bello",
    class: "SS3 Commercial",
    gender: "Female",
    status: "active",
    photo: null,
    guardian: "Mr. Bello",
    phone: "08088890123",
  },
];

const stats = [
  { label: "Total Students", value: 2847, icon: Users, color: "from-blue-500 to-blue-600" },
  { label: "Active Students", value: 2654, icon: UserCheck, color: "from-emerald-500 to-emerald-600" },
  { label: "Male Students", value: 1423, icon: GraduationCap, color: "from-purple-500 to-purple-600" },
  { label: "Female Students", value: 1424, icon: GraduationCap, color: "from-pink-500 to-pink-600" },
];

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

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
                <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">All Classes</option>
            <option value="jss1">JSS1</option>
            <option value="jss2">JSS2</option>
            <option value="jss3">JSS3</option>
            <option value="ss1">SS1</option>
            <option value="ss2">SS2</option>
            <option value="ss3">SS3</option>
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
        <div className="overflow-x-auto">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th>Student</th>
                <th>Admission No.</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Guardian</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockStudents.map((student) => (
                <tr key={student.id} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="text-white font-medium">{student.name}</span>
                    </div>
                  </td>
                  <td className="text-white/60">{student.admissionNo}</td>
                  <td className="text-white/60">{student.class}</td>
                  <td className="text-white/60">{student.gender}</td>
                  <td className="text-white/60">{student.guardian}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        student.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/dashboard/students/${student.id}`}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <p className="text-white/40 text-sm">
            Showing 1-6 of 2,847 students
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-all">
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-sm">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-all">
              2
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-all">
              3
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-all">
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
