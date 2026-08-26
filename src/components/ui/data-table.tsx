"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="skeleton h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchable = true,
  pagination = true,
  pageSize = 10,
  loading = false,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const safePage = Math.min(Math.max(1, page), totalPages || 1);
  const paginatedData = pagination
    ? filteredData.slice((safePage - 1) * pageSize, safePage * pageSize)
    : filteredData;

  const startItem = filteredData.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, filteredData.length);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (
        let i = Math.max(2, safePage - 1);
        i <= Math.min(totalPages - 1, safePage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#e2e8f0] text-[#1a1a2e] placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#e2e8f0]">
        <table className="w-full table-glass">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.className}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Inbox className="w-10 h-10" />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {paginatedData.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={col.className}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <p>
            Showing {startItem}–{endItem} of {filteredData.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-[#e2e8f0]"
            >
              <ChevronLeft className="w-4 h-4 text-[#1a1a2e]" />
            </button>
            {pageNumbers.map((p, i) =>
              typeof p === "string" ? (
                <span key={`dots-${i}`} className="text-gray-400 px-1">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border border-[#e2e8f0] ${
                    safePage === p
                      ? "bg-[var(--primary)] text-white"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-[#e2e8f0]"
            >
              <ChevronRight className="w-4 h-4 text-[#1a1a2e]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
