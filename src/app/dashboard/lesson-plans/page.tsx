"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, Plus, Eye, Edit3, Calendar, Clock } from "lucide-react";
import { downloadCSV } from "@/lib/exports";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const lessonPlans = [
  { id: "1", subject: "Mathematics", class: "JSS3A", topic: "Quadratic Equations", term: "Second Term", week: "Week 3", status: "approved", date: "2026-01-15", duration: "45 min" },
  { id: "2", subject: "English Language", class: "JSS3A", topic: "Essay Writing - Narrative", term: "Second Term", week: "Week 3", status: "approved", date: "2026-01-16", duration: "45 min" },
  { id: "3", subject: "Physics", class: "SS1A", topic: "Newton's Laws of Motion", term: "Second Term", week: "Week 3", status: "pending", date: "2026-01-17", duration: "45 min" },
  { id: "4", subject: "Chemistry", class: "SS2A", topic: "Organic Chemistry - Hydrocarbons", term: "Second Term", week: "Week 3", status: "draft", date: "2026-01-18", duration: "45 min" },
  { id: "5", subject: "Biology", class: "SS1B", topic: "Cell Structure and Function", term: "Second Term", week: "Week 4", status: "draft", date: "2026-01-22", duration: "45 min" },
  { id: "6", subject: "Computer Studies", class: "JSS2A", topic: "Introduction to Programming", term: "Second Term", week: "Week 4", status: "approved", date: "2026-01-23", duration: "45 min" },
];

export default function LessonPlansPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = lessonPlans.filter(lp =>
    (!search || lp.subject.toLowerCase().includes(search.toLowerCase()) || lp.topic.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || lp.status === statusFilter)
  );

  return (
    <motion.div {...fadeIn} className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-white/95 font-display tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <BookOpen className="w-[18px] h-[18px] text-white" />
            </div>
            Lesson Plans
          </h1>
          <p className="text-white/30 text-[12px] mt-1 ml-[46px]">Create and manage lesson plans for your classes</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCSV(filtered.map(lp => ({
              Subject: lp.subject, Class: lp.class, Topic: lp.topic, Term: lp.term, Week: lp.week, Status: lp.status, Date: lp.date, Duration: lp.duration,
            })), "lesson_plans")}
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 text-[13px] font-medium hover:bg-white/[0.08] transition flex items-center gap-2"
          >
            Export
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition shadow-lg shadow-[var(--primary)]/20 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Plan
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text"
            placeholder="Search by subject or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] outline-none focus:border-[var(--primary)]/50 appearance-none cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((lp) => (
          <motion.div
            key={lp.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.07] p-4 flex items-center gap-4 hover:bg-white/[0.05] transition"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-[13px] font-medium">{lp.topic}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-white/40 text-[11px]">{lp.subject}</span>
                <span className="text-white/20">·</span>
                <span className="text-white/40 text-[11px]">{lp.class}</span>
                <span className="text-white/20">·</span>
                <span className="text-white/40 text-[11px] flex items-center gap-1"><Calendar className="w-3 h-3" />{lp.date}</span>
                <span className="text-white/20">·</span>
                <span className="text-white/40 text-[11px] flex items-center gap-1"><Clock className="w-3 h-3" />{lp.duration}</span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
              lp.status === "approved" ? "bg-emerald-500/15 text-emerald-400" :
              lp.status === "pending" ? "bg-amber-500/15 text-amber-400" :
              "bg-white/[0.06] text-white/40"
            }`}>{lp.status}</span>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition"><Eye className="w-4 h-4" /></button>
              <button className="p-2 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition"><Edit3 className="w-4 h-4" /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
