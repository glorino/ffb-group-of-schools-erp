"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import {
  Bell,
  GraduationCap,
  CreditCard,
  AlertTriangle,
  Settings,
  Check,
  Trash2,
  Inbox,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "academic" | "finance" | "system" | "warning";
  read: boolean;
  createdAt: string;
}

type FilterType = "all" | "unread" | "academic" | "finance" | "system";

const iconMap: Record<string, typeof GraduationCap> = {
  academic: GraduationCap,
  finance: CreditCard,
  system: Settings,
  warning: AlertTriangle,
};

const typeColorMap: Record<string, { color: string; bg: string }> = {
  academic: { color: "#2563eb", bg: "#dbeafe" },
  finance: { color: "#16a34a", bg: "#dcfce7" },
  system: { color: "#7c3aed", bg: "#f3e8ff" },
  warning: { color: "#f97316", bg: "rgba(249,115,22,0.15)" },
};

const ROWS_PER_PAGE = 20;

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay > 1) return `${diffDay} days ago`;
  if (diffDay === 1) return "1 day ago";
  if (diffHr > 1) return `${diffHr} hours ago`;
  if (diffHr === 1) return "1 hour ago";
  if (diffMin > 1) return `${diffMin} min ago`;
  return "Just now";
}

function dateLabel(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function NotificationsPageInner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(ROWS_PER_PAGE),
      });
      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      toast.error("Failed to load notifications");
    }
    setLoading(false);
  }, [currentPage]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Unread", value: "unread" },
    { label: "Academic", value: "academic" },
    { label: "Finance", value: "finance" },
    { label: "System", value: "system" },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const totalPages = Math.ceil(filteredNotifications.length / ROWS_PER_PAGE);
  const paginated = filteredNotifications.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      if (!res.ok) throw new Error("Failed");
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const grouped = paginated.reduce(
    (acc, n) => {
      const label = dateLabel(n.createdAt);
      (acc[label] = acc[label] || []).push(n);
      return acc;
    },
    {} as Record<string, Notification[]>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    border: "2px solid #e5e7eb",
    color: "#1a1a2e",
    fontSize: "13px",
    outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #0a2a6e, #0055ff)",
          borderRadius: "16px",
          padding: "32px",
          margin: "32px 16px 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-50%",
            right: "-20%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30%",
            left: "-10%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "4px",
              }}
            >
              <Bell style={{ width: "24px", height: "24px", color: "#ffffff" }} />
              <h1
                style={{
                  color: "#ffffff",
                  fontSize: "24px",
                  fontWeight: 700,
                }}
              >
                Notifications
              </h1>
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                padding: "10px 20px",
                borderRadius: "12px",
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              <Check style={{ width: "16px", height: "16px" }} />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "0 16px",
          overflowX: "auto",
          flexWrap: "wrap",
        }}
      >
        {filters.map((f) => {
          const isActive = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 400,
                whiteSpace: "nowrap",
                cursor: "pointer",
                border: isActive
                  ? "2px solid #0055ff"
                  : "1px solid #e2e8f0",
                backgroundColor: isActive ? "rgba(0,85,255,0.08)" : "#ffffff",
                color: isActive ? "#0055ff" : "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s",
              }}
            >
              {f.label}
              {f.value === "unread" && unreadCount > 0 && (
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: "10px",
                    backgroundColor: "#dc2626",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: 600,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "24px",
          margin: "0 16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{ color: "#1a1a2e", fontSize: "18px", fontWeight: 600 }}
          >
            All Notifications
          </h3>
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 0",
            }}
          >
            <Loader2
              style={{
                width: "32px",
                height: "32px",
                color: "#64748b",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "#64748b",
            }}
          >
            <Inbox
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 12px",
                opacity: 0.4,
              }}
            />
            <p style={{ fontSize: "15px", fontWeight: 500, color: "#1a1a2e", marginBottom: "4px" }}>
              No notifications
            </p>
            <p style={{ fontSize: "13px" }}>
              {filter === "all"
                ? "You're all caught up! No notifications to display."
                : `No ${filter} notifications found.`}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <h3
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "12px",
                  }}
                >
                  {date}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {items.map((n) => {
                    const Icon = iconMap[n.type] || Settings;
                    const tc = typeColorMap[n.type] || typeColorMap.system;
                    return (
                      <div
                        key={n.id}
                        style={{
                          backgroundColor: "#f8fafc",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          borderLeft: !n.read ? "3px solid #0055ff" : "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "16px",
                          padding: "16px",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f1f5f9")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f8fafc")
                        }
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            backgroundColor: tc.bg,
                            color: tc.color,
                          }}
                        >
                          <Icon style={{ width: "20px", height: "20px" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: "12px",
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  color: "#1a1a2e",
                                  fontWeight: 500,
                                  fontSize: "13px",
                                }}
                              >
                                {n.title}
                              </p>
                              <p
                                style={{
                                  color: "#475569",
                                  fontSize: "13px",
                                  marginTop: "2px",
                                }}
                              >
                                {n.message}
                              </p>
                            </div>
                            <span
                              style={{
                                color: "#94a3b8",
                                fontSize: "12px",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                              }}
                            >
                              {timeAgo(n.createdAt)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              marginTop: "8px",
                            }}
                          >
                            {!n.read && (
                              <button
                                onClick={() => markAsRead(n.id)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  color: "#0055ff",
                                  fontSize: "12px",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 0,
                                  fontWeight: 500,
                                }}
                              >
                                <Check style={{ width: "12px", height: "12px" }} />
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(n.id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "#94a3b8",
                                fontSize: "12px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                                transition: "color 0.15s",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "#dc2626")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color = "#94a3b8")
                              }
                            >
                              <Trash2 style={{ width: "12px", height: "12px" }} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "8px",
                  paddingTop: "16px",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Showing{" "}
                  {(currentPage - 1) * ROWS_PER_PAGE + 1}–
                  {Math.min(
                    currentPage * ROWS_PER_PAGE,
                    filteredNotifications.length
                  )}{" "}
                  of {filteredNotifications.length}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      color: "#475569",
                      fontSize: "13px",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      opacity: currentPage === 1 ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <ChevronLeft style={{ width: "14px", height: "14px" }} />
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          backgroundColor:
                            currentPage === page ? "#0055ff" : "#ffffff",
                          color:
                            currentPage === page ? "#ffffff" : "#475569",
                          fontSize: "13px",
                          fontWeight: currentPage === page ? 500 : 400,
                          cursor: "pointer",
                        }}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      color: "#475569",
                      fontSize: "13px",
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Next
                    <ChevronRight style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 0",
          }}
        >
          <Loader2
            style={{
              width: "32px",
              height: "32px",
              color: "#64748b",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      }
    >
      <NotificationsPageInner />
    </Suspense>
  );
}
