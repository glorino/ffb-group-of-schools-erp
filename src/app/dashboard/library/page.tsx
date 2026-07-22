"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
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
  Loader2,
  Download,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  copies: number;
  available: number;
  category: string;
  status: string;
}

interface Borrowing {
  id: string;
  student: { firstName: string; lastName: string };
  book: { title: string };
  dueDate: string;
  status: string;
}

interface LibraryStats {
  totalTitles: number;
  totalBooks: number;
  availableBooks: number;
  borrowed: number;
}

export default function LibraryPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isStudent = userRoles.includes("STUDENT");
  const isParent = userRoles.includes("PARENT");
  const isReadOnly = isStudent || isParent;

  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [stats, setStats] = useState<LibraryStats>({ totalTitles: 0, totalBooks: 0, availableBooks: 0, borrowed: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", isbn: "", category: "Textbook", copies: "", publisher: "" });
  const [viewBook, setViewBook] = useState<LibraryBook | null>(null);
  const [editBook, setEditBook] = useState<LibraryBook | null>(null);
  const [editForm, setEditForm] = useState({ title: "", author: "", isbn: "", category: "", copies: "", available: "", location: "" });
  const [showPenalties, setShowPenalties] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/library");
      const data = await res.json();
      setBooks(data.books || []);
      setBorrowings(data.borrowings || []);
      setStats(data.stats || { totalTitles: 0, totalBooks: 0, availableBooks: 0, borrowed: 0 });
    } catch {
      toast.error("Failed to load library data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.copies) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          author: form.author,
          isbn: form.isbn,
          category: form.category,
          copies: parseInt(form.copies),
          publisher: form.publisher,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Book added successfully");
      setShowModal(false);
      setForm({ title: "", author: "", isbn: "", category: "Textbook", copies: "", publisher: "" });
      fetchData();
    } catch {
      toast.error("Failed to add book");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: "Total Titles", value: stats.totalTitles, icon: BookOpen, color: "from-blue-500 to-blue-600" },
    { label: "Borrowed", value: stats.borrowed, icon: ArrowUpDown, color: "from-emerald-500 to-emerald-600" },
    { label: "Available", value: stats.availableBooks, icon: CheckCircle, color: "from-purple-500 to-purple-600" },
    { label: "Overdue", value: borrowings.filter((b) => b.status === "overdue").length, icon: AlertCircle, color: "from-red-500 to-red-600" },
  ];

  const handleExport = () => {
    const data = books.map((b) => ({
      Title: b.title,
      Author: b.author,
      ISBN: b.isbn,
      Category: b.category,
      Copies: b.copies,
      Available: b.available,
      Status: b.status,
    }));
    downloadCSV(data, "library_books");
    toast.success("CSV downloaded");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

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
            <p className="text-white/60 text-[13px]">
              Manage books, borrowing, reservations, and penalties
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-[13px] font-medium hover:bg-white/[0.1] transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            {!isReadOnly && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all duration-200 shadow-lg shadow-[var(--primary)]/25"
              >
                <Plus className="w-4 h-4" />
                Add Book
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-[12px] mb-1">{stat.label}</p>
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <button className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08]">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left text-white/50 text-[13px] font-medium pb-3">Title</th>
                  <th className="text-left text-white/50 text-[13px] font-medium pb-3">Author</th>
                  <th className="text-left text-white/50 text-[13px] font-medium pb-3">Category</th>
                  <th className="text-left text-white/50 text-[13px] font-medium pb-3">Copies</th>
                  <th className="text-left text-white/50 text-[13px] font-medium pb-3">Available</th>
                  <th className="text-left text-white/50 text-[13px] font-medium pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-all">
                    <td className="py-3 text-white font-medium text-[13px]">{book.title}</td>
                    <td className="py-3 text-white/70 text-[13px]">{book.author}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-lg bg-white/[0.08] text-white/70 text-[12px]">{book.category}</span>
                    </td>
                    <td className="py-3 text-white/70 text-[13px]">{book.copies}</td>
                    <td className="py-3 text-white/70 text-[13px]">{book.available}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setViewBook(book)}
                          className="p-1 rounded-lg hover:bg-white/[0.08] text-white/40"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isReadOnly && (
                          <button
                            onClick={() => {
                              setEditBook(book);
                              setEditForm({
                                title: book.title || "", author: book.author || "", isbn: book.isbn || "",
                                category: book.category || "", copies: String(book.copies ?? ""),
                                available: String(book.available ?? ""), location: "",
                              });
                            }}
                            className="p-1 rounded-lg hover:bg-white/[0.08] text-white/40"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBooks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-white/40 text-[13px]">No books found</td>
                  </tr>
                )}
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
              {borrowings.map((borrow) => (
                <div key={borrow.id} className="p-3 rounded-xl bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-[13px] font-medium">{borrow.student.firstName} {borrow.student.lastName}</span>
                    <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                      borrow.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {borrow.status}
                    </span>
                  </div>
                  <p className="text-white/40 text-[12px]">{borrow.book.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-white/30" />
                    <span className="text-white/30 text-[12px]">Due: {new Date(borrow.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {borrowings.length === 0 && (
                <p className="text-center py-4 text-white/40 text-[13px]">No borrowings yet</p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Penalties</h3>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-[13px] font-medium">{borrowings.filter((b) => b.status === "overdue").length} Overdue Books</span>
              </div>
              <p className="text-white/40 text-[12px]">Total penalties: ₦{(borrowings.filter((b) => b.status === "overdue").length * 500).toLocaleString()}</p>
              <button
                onClick={() => setShowPenalties(true)}
                className="mt-3 w-full py-2 rounded-lg bg-red-500/20 text-red-400 text-[13px] hover:bg-red-500/30 transition-all"
              >
                View Details
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">Add Book</h2>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. Mathematics for Junior Secondary"
                />
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Author</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. A.O. Adesoji"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 text-[13px] mb-1">ISBN</label>
                  <input
                    type="text"
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="978-0123456789"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1">Copies</label>
                  <input
                    type="number"
                    value={form.copies}
                    onChange={(e) => setForm({ ...form, copies: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ colorScheme: "dark" }}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option style={{ background: "#0f1b33", color: "#fff" }}>Textbook</option>
                  <option style={{ background: "#0f1b33", color: "#fff" }}>Literature</option>
                  <option style={{ background: "#0f1b33", color: "#fff" }}>Exam Prep</option>
                  <option style={{ background: "#0f1b33", color: "#fff" }}>Reference</option>
                  <option style={{ background: "#0f1b33", color: "#fff" }}>Practical</option>
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Publisher</label>
                <input
                  type="text"
                  value={form.publisher}
                  onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. Heinemann"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/25"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Add Book"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {viewBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">{viewBook.title}</h2>
              <button onClick={() => setViewBook(null)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-white/40 text-[12px] mb-1">Author</p>
                  <p className="text-white text-[13px] font-medium">{viewBook.author}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-white/40 text-[12px] mb-1">ISBN</p>
                  <p className="text-white text-[13px] font-medium">{viewBook.isbn}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-white/40 text-[12px] mb-1">Category</p>
                  <p className="text-white text-[13px] font-medium">{viewBook.category}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-white/40 text-[12px] mb-1">Copies</p>
                  <p className="text-white text-[13px] font-medium">{viewBook.copies}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-white/40 text-[12px] mb-1">Available</p>
                  <p className="text-white text-[13px] font-medium">{viewBook.available}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-white/40 text-[12px] mb-1">Status</p>
                  <p className={`text-[13px] font-medium ${viewBook.status === "available" ? "text-emerald-400" : "text-red-400"}`}>{viewBook.status}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Book Modal */}
      <AnimatePresence>
        {editBook && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditBook(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#0a0f1e] border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Edit Book</h3>
                <button onClick={() => setEditBook(null)} className="p-1 rounded-lg hover:bg-white/10 text-white/40"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch("/api/library", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editBook.id, ...editForm, copies: Number(editForm.copies), available: Number(editForm.available) }),
                  });
                  if (!res.ok) throw new Error("Failed");
                  toast.success("Book updated");
                  setEditBook(null);
                  fetch("/api/library").then(r => r.json()).then(d => setBooks(d.books || []));
                } catch { toast.error("Failed to update"); }
              }} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Title *</label>
                  <input type="text" required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Author</label>
                    <input type="text" value={editForm.author} onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">ISBN</label>
                    <input type="text" value={editForm.isbn} onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Category</label>
                    <input type="text" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Copies</label>
                    <input type="number" min="0" value={editForm.copies} onChange={(e) => setEditForm({ ...editForm, copies: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Available</label>
                    <input type="number" min="0" value={editForm.available} onChange={(e) => setEditForm({ ...editForm, available: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setEditBook(null)} className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all shadow-lg shadow-[var(--primary)]/25">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showPenalties && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPenalties(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">Penalty Details</h2>
              <button onClick={() => setShowPenalties(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left text-white/50 text-[13px] font-medium pb-3">Student</th>
                    <th className="text-left text-white/50 text-[13px] font-medium pb-3">Book</th>
                    <th className="text-left text-white/50 text-[13px] font-medium pb-3">Due Date</th>
                    <th className="text-left text-white/50 text-[13px] font-medium pb-3">Days Overdue</th>
                    <th className="text-left text-white/50 text-[13px] font-medium pb-3">Penalty</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowings.filter(b => b.status === "overdue").map((borrow) => {
                    const daysOverdue = Math.max(0, Math.ceil((Date.now() - new Date(borrow.dueDate).getTime()) / 86400000));
                    const penalty = daysOverdue * 100;
                    return (
                      <tr key={borrow.id} className="border-b border-white/5">
                        <td className="py-3 text-white text-[13px]">{borrow.student.firstName} {borrow.student.lastName}</td>
                        <td className="py-3 text-white/70 text-[13px]">{borrow.book.title}</td>
                        <td className="py-3 text-white/70 text-[13px]">{new Date(borrow.dueDate).toLocaleDateString()}</td>
                        <td className="py-3 text-red-400 text-[13px]">{daysOverdue}</td>
                        <td className="py-3 text-red-400 font-medium text-[13px]">₦{penalty.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {borrowings.filter(b => b.status === "overdue").length === 0 && (
                <p className="text-center py-8 text-white/40 text-[13px]">No overdue books</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
