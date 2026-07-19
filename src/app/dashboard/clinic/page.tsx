"use client";

import { motion } from "framer-motion";
import {
  Heart,
  Users,
  Plus,
  Search,
  Filter,
  Activity,
  Pill,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Thermometer,
  Stethoscope,
} from "lucide-react";

const patients = [
  { id: 1, name: "Chidinma Okafor", class: "JSS1A", issue: "Headache", date: "Jan 15, 2025", status: "treated", severity: "low" },
  { id: 2, name: "Emeka Nwosu", class: "SS2A", issue: "Malaria", date: "Jan 14, 2025", status: "treated", severity: "medium" },
  { id: 3, name: "Fatima Bello", class: "JSS3A", issue: "Stomach ache", date: "Jan 15, 2025", status: "pending", severity: "low" },
  { id: 4, name: "Oluwaseun Adeyemi", class: "SS1B", issue: "Sprained ankle", date: "Jan 13, 2025", status: "treated", severity: "medium" },
  { id: 5, name: "Ngozi Okwu", class: "SS3A", issue: "Fever", date: "Jan 15, 2025", status: "treated", severity: "low" },
];

const medications = [
  { name: "Paracetamol", stock: 500, used: 120, category: "Analgesic" },
  { name: "Amalar", stock: 200, used: 85, category: "Antimalarial" },
  { name: "Amoxicillin", stock: 150, used: 45, category: "Antibiotic" },
  { name: "ORS", stock: 300, used: 90, category: "Rehydration" },
];

const stats = [
  { label: "Total Visits", value: "1,250", icon: Users, color: "from-blue-500 to-blue-600" },
  { label: "Today's Visits", value: "12", icon: Clock, color: "from-emerald-500 to-emerald-600" },
  { label: "Medications", value: "85", icon: Pill, color: "from-purple-500 to-purple-600" },
  { label: "Alerts", value: "3", icon: AlertTriangle, color: "from-orange-500 to-orange-600" },
];

export default function ClinicPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Clinic / Medical Records</h1>
            <p className="text-white/60">
              Manage student visits, medications, allergies, and health records
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" />
            New Visit
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
            <h3 className="text-white font-semibold text-lg">Recent Visits</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {patients.map((patient) => (
              <div key={patient.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  patient.severity === "high" ? "bg-red-500/20 text-red-400" :
                  patient.severity === "medium" ? "bg-orange-500/20 text-orange-400" :
                  "bg-emerald-500/20 text-emerald-400"
                }`}>
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{patient.name}</p>
                  <p className="text-white/40 text-xs">{patient.class} • {patient.issue}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    patient.status === "treated" ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                  }`}>
                    {patient.status}
                  </span>
                  <p className="text-white/30 text-xs mt-1">{patient.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Medications Stock</h3>
            <div className="space-y-3">
              {medications.map((med, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{med.name}</span>
                    <span className="text-white/40 text-xs">{med.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/40">Stock: {med.stock}</span>
                    <span className="text-white/40">Used: {med.used}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (med.stock - med.used) / med.stock < 0.2 ? "bg-red-500" : "bg-[var(--accent)]"
                      }`}
                      style={{ width: `${((med.stock - med.used) / med.stock) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Health Alerts</h3>
            <div className="space-y-2">
              {[
                { alert: "Low stock: Amalar", severity: "high" },
                { alert: "Allergy alert: Chidinma O.", severity: "medium" },
                { alert: "Vaccination due: JSS1", severity: "low" },
              ].map((alert, i) => (
                <div key={i} className={`p-3 rounded-xl ${
                  alert.severity === "high" ? "bg-red-500/10 border border-red-500/20" :
                  alert.severity === "medium" ? "bg-orange-500/10 border border-orange-500/20" :
                  "bg-white/5"
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      alert.severity === "high" ? "text-red-400" :
                      alert.severity === "medium" ? "text-orange-400" : "text-white/40"
                    }`} />
                    <span className="text-white text-sm">{alert.alert}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
