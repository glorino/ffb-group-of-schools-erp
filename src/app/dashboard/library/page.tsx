"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/school-config";
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
  ChevronLeft,
  ChevronRight,
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 16px",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  color: "#1a1a2e",
  fontSize: "13px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "13px",
  marginBottom: "6px",
  display: "block",
};

const btnStyle = (bg: string, disabled?: boolean): React.CSSProperties => ({
  padding: "8px 16px",
  borderRadius: "12px",
  backgroundColor: bg,
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 500,
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.5 : 1,
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
});

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  padding: "24px",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#64748b",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  fontSize: "13px",
  color: "#334155",
};

const statusActive: React.CSSProperties = {
  backgroundColor: "#dcfce7",
  color: "#16a34a",
  padding: "4px 8px",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: 500,
};

const statusOverdue: React.CSSProperties = {
  backgroundColor: "#fee2e2",
  color: "#dc2626",
  padding: "4px 8px",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: 500,
};

const BOOKS_PER_PAGE = 20;

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
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ studentId: "", bookId: "", dueDate: "" });
  const [bookPage, setBookPage] = useState(1);

  useEffect(() => {
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);
    setIssueForm((prev) => ({
      ...prev,
      dueDate: defaultDueDate.toISOString().split("T")[0],
    }));
  }, []);

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

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.studentId || !issueForm.bookId || !issueForm.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: issueForm.studentId,
          bookId: issueForm.bookId,
          dueDate: issueForm.dueDate,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Book issued successfully");
      setShowIssueModal(false);
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 14);
      setIssueForm({ studentId: "", bookId: "", dueDate: defaultDueDate.toISOString().split("T")[0] });
      fetchData();
    } catch {
      toast.error("Failed to issue book");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnBook = async (borrowId: string) => {
    try {
      const res = await fetch("/api/library", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: borrowId, action: "update", status: "returned" }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Book returned successfully");
      fetchData();
    } catch {
      toast.error("Failed to return book");
    }
  };

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  const bookStartIdx = (bookPage - 1) * BOOKS_PER_PAGE;
  const paginatedBooks = filteredBooks.slice(bookStartIdx, bookStartIdx + BOOKS_PER_PAGE);
  const totalBookPages = Math.max(1, Math.ceil(filteredBooks.length / BOOKS_PER_PAGE));

  const statCards = [
    { label: "Total Titles", value: stats.totalTitles, icon: BookOpen, color: "linear-gradient(135deg, #0055ff, #0033cc)" },
    { label: "Borrowed", value: stats.borrowed, icon: ArrowUpDown, color: "linear-gradient(135deg, #10b981, #059669)" },
    { label: "Available", value: stats.availableBooks, icon: CheckCircle, color: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
    { label: "Overdue", value: borrowings.filter((b) => b.status === "overdue").length, icon: AlertCircle, color: "linear-gradient(135deg, #ef4444, #dc2626)" },
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <Loader2 style={{ width: "32px", height: "32px", color: "#0055ff", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "16px", padding: "32px", marginTop: "32px", margin: "0 16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-30%", left: "-10%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ color: "#ffffff", fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Library Management</h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>
                Manage books, borrowing, reservations, and penalties
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={handleExport} style={btnStyle("#64748b")}>
                <Download style={{ width: "16px", height: "16px" }} />
                Export
              </button>
              {!isReadOnly && (
                <>
                  <button onClick={() => setShowIssueModal(true)} style={btnStyle("#10b981")}>
                    <BookOpen style={{ width: "16px", height: "16px" }} />
                    Issue Book
                  </button>
                  <button onClick={() => setShowModal(true)} style={btnStyle("#0055ff")}>
                    <Plus style={{ width: "16px", height: "16px" }} />
                    Add Book
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {statCards.map((stat, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>{stat.label}</p>
                <p style={{ fontSize: "30px", fontWeight: 700, color: "#1a1a2e" }}>{stat.value}</p>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: stat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon style={{ width: "24px", height: "24px", color: "#ffffff" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h3 style={{ color: "#1a1a2e", fontWeight: 600, fontSize: "18px" }}>Book Catalog</h3>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ position: "relative" }}>
                <Search style={{ width: "16px", height: "16px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setBookPage(1); }}
                  style={{ ...inputStyle, paddingLeft: "36px" }}
                />
              </div>
              <button title="Filter using search above" style={{ ...inputStyle, width: "auto", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Filter style={{ width: "16px", height: "16px", color: "#475569" }} />
              </button>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Author</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Copies</th>
                  <th style={thStyle}>Available</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBooks.map((book) => (
                  <tr key={book.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{book.title}</td>
                    <td style={tdStyle}>{book.author}</td>
                    <td style={tdStyle}>
                      <span style={{ backgroundColor: "#f1f5f9", color: "#475569", padding: "4px 8px", borderRadius: "8px", fontSize: "12px" }}>{book.category}</span>
                    </td>
                    <td style={tdStyle}>{book.copies}</td>
                    <td style={tdStyle}>{book.available}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={() => setViewBook(book)}
                          style={{ padding: "6px", borderRadius: "8px", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                        >
                          <Eye style={{ width: "16px", height: "16px" }} />
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
                            style={{ padding: "6px", borderRadius: "8px", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                          >
                            <Edit style={{ width: "16px", height: "16px" }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedBooks.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b", fontSize: "13px" }}>No books found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredBooks.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
              <p style={{ color: "#64748b", fontSize: "13px" }}>
                Showing {bookStartIdx + 1}–{Math.min(bookStartIdx + BOOKS_PER_PAGE, filteredBooks.length)} of {filteredBooks.length}
              </p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  onClick={() => setBookPage((p) => Math.max(1, p - 1))}
                  disabled={bookPage === 1}
                  style={btnStyle("#f1f5f9", bookPage === 1)}
                >
                  <ChevronLeft style={{ width: "16px", height: "16px", color: bookPage === 1 ? "#cbd5e1" : "#475569" }} />
                </button>
                <span style={{ fontSize: "13px", color: "#64748b" }}>{bookPage} / {totalBookPages}</span>
                <button
                  onClick={() => setBookPage((p) => Math.min(totalBookPages, p + 1))}
                  disabled={bookPage >= totalBookPages}
                  style={btnStyle("#f1f5f9", bookPage >= totalBookPages)}
                >
                  <ChevronRight style={{ width: "16px", height: "16px", color: bookPage >= totalBookPages ? "#cbd5e1" : "#475569" }} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={cardStyle}>
            <h3 style={{ color: "#1a1a2e", fontWeight: 600, fontSize: "18px", marginBottom: "16px" }}>Recent Borrowings</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {borrowings.map((borrow) => (
                <div key={borrow.id} style={{ padding: "12px", borderRadius: "12px", backgroundColor: "#f8fafc" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "#1a1a2e", fontSize: "13px", fontWeight: 500 }}>{borrow.student.firstName} {borrow.student.lastName}</span>
                    <span style={borrow.status === "active" ? statusActive : statusOverdue}>
                      {borrow.status}
                    </span>
                  </div>
                  <p style={{ color: "#64748b", fontSize: "12px" }}>{borrow.book.title}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px", marginTop: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock style={{ width: "12px", height: "12px", color: "#94a3b8" }} />
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>Due: {new Date(borrow.dueDate).toLocaleDateString()}</span>
                    </div>
                    {borrow.status === "active" && !isReadOnly && (
                      <button
                        onClick={() => handleReturnBook(borrow.id)}
                        style={{ padding: "4px 8px", borderRadius: "8px", backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "11px", fontWeight: 500, border: "none", cursor: "pointer" }}
                      >
                        Return
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {borrowings.length === 0 && (
                <p style={{ textAlign: "center", padding: "16px", color: "#64748b", fontSize: "13px" }}>No borrowings yet</p>
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ color: "#1a1a2e", fontWeight: 600, fontSize: "18px", marginBottom: "16px" }}>Penalties</h3>
            <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <AlertCircle style={{ width: "16px", height: "16px", color: "#dc2626" }} />
                <span style={{ color: "#dc2626", fontSize: "13px", fontWeight: 500 }}>{borrowings.filter((b) => b.status === "overdue").length} Overdue Books</span>
              </div>
              <p style={{ color: "#64748b", fontSize: "12px" }}>Total penalties: {formatCurrency(borrowings.filter((b) => b.status === "overdue").length * 500)}</p>
              <button
                onClick={() => setShowPenalties(true)}
                style={{ marginTop: "12px", width: "100%", padding: "8px", borderRadius: "8px", backgroundColor: "#fee2e2", color: "#dc2626", fontSize: "13px", border: "none", cursor: "pointer" }}
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ width: "100%", maxWidth: "500px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>Add Book</h2>
              <button onClick={() => setShowModal(false)} style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. Mathematics for Junior Secondary"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Author</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. A.O. Adesoji"
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>ISBN</label>
                    <input
                      type="text"
                      value={form.isbn}
                      onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                      style={inputStyle}
                      placeholder="978-0123456789"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Copies</label>
                    <input
                      type="number"
                      value={form.copies}
                      onChange={(e) => setForm({ ...form, copies: e.target.value })}
                      style={inputStyle}
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ ...inputStyle, colorScheme: "light" }}
                  >
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Textbook</option>
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Literature</option>
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Exam Prep</option>
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Reference</option>
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Practical</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Publisher</label>
                  <input
                    type="text"
                    value={form.publisher}
                    onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. Heinemann"
                  />
                </div>
                <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ ...btnStyle("#f1f5f9"), flex: 1, color: "#475569" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ ...btnStyle("#0055ff", submitting), flex: 1 }}
                  >
                    {submitting ? <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} /> : "Add Book"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showIssueModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ width: "100%", maxWidth: "500px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>Issue Book</h2>
              <button onClick={() => setShowIssueModal(false)} style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <form onSubmit={handleIssueBook} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Student ID *</label>
                  <input
                    type="text"
                    value={issueForm.studentId}
                    onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. STU-2024-001"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Book *</label>
                  <select
                    value={issueForm.bookId}
                    onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
                    style={{ ...inputStyle, colorScheme: "light" }}
                    required
                  >
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="">Select a book</option>
                    {books.filter((b) => b.available > 0).map((book) => (
                      <option key={book.id} style={{ background: "#ffffff", color: "#1a1a2e" }} value={book.id}>
                        {book.title} ({book.available} available)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Due Date *</label>
                  <input
                    type="date"
                    value={issueForm.dueDate}
                    onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                    style={{ ...inputStyle, colorScheme: "light" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    style={{ ...btnStyle("#f1f5f9"), flex: 1, color: "#475569" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ ...btnStyle("#0055ff", submitting), flex: 1 }}
                  >
                    {submitting ? <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} /> : "Issue Book"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {viewBook && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ width: "100%", maxWidth: "500px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>{viewBook.title}</h2>
              <button onClick={() => setViewBook(null)} style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "#f8fafc" }}>
                  <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>Author</p>
                  <p style={{ color: "#1a1a2e", fontSize: "13px", fontWeight: 500 }}>{viewBook.author}</p>
                </div>
                <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "#f8fafc" }}>
                  <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>ISBN</p>
                  <p style={{ color: "#1a1a2e", fontSize: "13px", fontWeight: 500 }}>{viewBook.isbn}</p>
                </div>
                <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "#f8fafc" }}>
                  <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>Category</p>
                  <p style={{ color: "#1a1a2e", fontSize: "13px", fontWeight: 500 }}>{viewBook.category}</p>
                </div>
                <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "#f8fafc" }}>
                  <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>Copies</p>
                  <p style={{ color: "#1a1a2e", fontSize: "13px", fontWeight: 500 }}>{viewBook.copies}</p>
                </div>
                <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "#f8fafc" }}>
                  <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>Available</p>
                  <p style={{ color: "#1a1a2e", fontSize: "13px", fontWeight: 500 }}>{viewBook.available}</p>
                </div>
                <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "#f8fafc" }}>
                  <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>Status</p>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: viewBook.status === "available" ? "#16a34a" : "#dc2626" }}>{viewBook.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editBook && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div onClick={() => setEditBook(null)} style={{ position: "absolute", inset: 0 }} />
          <div style={{ position: "relative", width: "100%", maxWidth: "560px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>Edit Book</h2>
              <button onClick={() => setEditBook(null)} style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
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
              }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input type="text" required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Author</label>
                    <input type="text" value={editForm.author} onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                      style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>ISBN</label>
                    <input type="text" value={editForm.isbn} onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })}
                      style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <input type="text" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Copies</label>
                    <input type="number" min="0" value={editForm.copies} onChange={(e) => setEditForm({ ...editForm, copies: e.target.value })}
                      style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Available</label>
                    <input type="number" min="0" value={editForm.available} onChange={(e) => setEditForm({ ...editForm, available: e.target.value })}
                      style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "8px" }}>
                  <button type="button" onClick={() => setEditBook(null)} style={btnStyle("#f1f5f9")}>Cancel</button>
                  <button type="submit" style={btnStyle("#0055ff")}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showPenalties && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => setShowPenalties(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "600px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>Penalty Details</h2>
              <button onClick={() => setShowPenalties(false)} style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                      <th style={thStyle}>Student</th>
                      <th style={thStyle}>Book</th>
                      <th style={thStyle}>Due Date</th>
                      <th style={thStyle}>Days Overdue</th>
                      <th style={thStyle}>Penalty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowings.filter(b => b.status === "overdue").map((borrow) => {
                      const daysOverdue = Math.max(0, Math.ceil((Date.now() - new Date(borrow.dueDate).getTime()) / 86400000));
                      const penalty = daysOverdue * 100;
                      return (
                        <tr key={borrow.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={tdStyle}>{borrow.student.firstName} {borrow.student.lastName}</td>
                          <td style={tdStyle}>{borrow.book.title}</td>
                          <td style={tdStyle}>{new Date(borrow.dueDate).toLocaleDateString()}</td>
                          <td style={{ ...tdStyle, color: "#dc2626" }}>{daysOverdue}</td>
                          <td style={{ ...tdStyle, color: "#dc2626", fontWeight: 500 }}>{formatCurrency(penalty)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {borrowings.filter(b => b.status === "overdue").length === 0 && (
                  <p style={{ textAlign: "center", padding: "32px", color: "#64748b", fontSize: "13px" }}>No overdue books</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
