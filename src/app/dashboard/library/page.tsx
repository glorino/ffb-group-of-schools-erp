"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Plus,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

const books = [
  { id: 1, title: "Mathematics for Junior Secondary", author: "A.O. Adesoji", isbn: "978-0123456789", copies: 50, available: 42, category: "Textbook", status: "available" },
  { id: 2, title: "English Grammar and Composition", author: "F.B. Oyebade", isbn: "978-0234567890", copies: 45, available: 38, category: "Textbook", status: "available" },
  { id: 3, title: "Countdown to WAEC Mathematics", author: "J.O. Ajose", isbn: "978-0345678901", copies: 30, available: 25, category: "Exam Prep", status: "available" },
  { id: 4, title: "African Novels Anthology", author: "Various", isbn: "978-0456789012", copies: 40, available: 35, category: "Literature", status: "available" },
  { id: 5, title: "Physics Practical Manual", author: "E.O. Obioha", isbn: "978-0567890123", copies: 25, available: 20, category: "Practical", status: "available" },
];

const borrowedBooks = [
  { student: "Chidinma Okafor", book: "Mathematics for Junior Secondary", dueDate: "Jan 20, 2025", status: "active" },
  { student: "Emeka Nwosu", book: "English Grammar and Composition", dueDate: "Jan 18, 2025", status: "overdue" },
  { student: "Fatima Bello", book: "Countdown to WAEC Mathematics", dueDate: "Jan 25, 2025", status: "active" },
  { student: "Oluwaseun Adeyemi", book: "African Novels Anthology", dueDate: "Jan 22, 2025", status: "active" },
];

const stats = [
  { label: "Total Books", value: "4,500", icon: BookOpen, color: "from-blue-500 to-blue-600" },
  { label: "Borrowed", value: "1,200", icon: ArrowUpDown, color: "from-emerald-500 to-emerald-600" },
  { label: "Available", value: "3,300", icon: CheckCircle, color: "from-purple-500 to-purple-600" },
  { label: "Overdue", value: "45", icon: AlertCircle, color: "from-red-500 to-red-600" },
];

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Library Management</h1>
            <p className="text-white/60">
              Manage books, borrowing, reservations, and penalties
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" />
            Add Book
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Book Catalog</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search books..."
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
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Title</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Author</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Category</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Copies</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Available</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="py-3 text-white font-medium text-sm">{book.title}</td>
                    <td className="py-3 text-white/70 text-sm">{book.author}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-lg bg-white/10 text-white/70 text-xs">{book.category}</span>
                    </td>
                    <td className="py-3 text-white/70 text-sm">{book.copies}</td>
                    <td className="py-3 text-white/70 text-sm">{book.available}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button className="p-1 rounded-lg hover:bg-white/10 text-white/40">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 rounded-lg hover:bg-white/10 text-white/40">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
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
          className="space-y-6"
        >
          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Recent Borrowings</h3>
            <div className="space-y-3">
              {borrowedBooks.map((borrow, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{borrow.student}</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      borrow.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {borrow.status}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs">{borrow.book}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-white/30" />
                    <span className="text-white/30 text-xs">Due: {borrow.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Penalties</h3>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">45 Overdue Books</span>
              </div>
              <p className="text-white/40 text-xs">Total penalties: ₦22,500</p>
              <button className="mt-3 w-full py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-all">
                View Details
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
