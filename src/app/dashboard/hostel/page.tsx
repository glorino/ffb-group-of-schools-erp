"use client";

import { motion } from "framer-motion";
import {
  Building,
  Users,
  Bed,
  Plus,
  Search,
  QrCode,
  CheckCircle,
  AlertCircle,
  Wifi,
  Thermometer,
  Eye,
  Edit,
} from "lucide-react";

const blocks = [
  { id: 1, name: "Block A", type: "Boys", rooms: 20, occupied: 18, capacity: 80, status: "active" },
  { id: 2, name: "Block B", type: "Girls", rooms: 20, occupied: 16, capacity: 80, status: "active" },
  { id: 3, name: "Block C", type: "Boys", rooms: 15, occupied: 12, capacity: 60, status: "active" },
  { id: 4, name: "Block D", type: "Staff", rooms: 10, occupied: 8, capacity: 10, status: "active" },
];

const rooms = [
  { id: 1, block: "Block A", number: "101", beds: 4, occupied: 4, status: "full", students: ["Chidi O.", "Emeka N.", "Tunde A.", "Olusegun B."] },
  { id: 2, block: "Block A", number: "102", beds: 4, occupied: 3, status: "available", students: ["Ahmed M.", "Ibrahim K.", "Yusuf A."] },
  { id: 3, block: "Block B", number: "201", beds: 4, occupied: 4, status: "full", students: ["Fatima A.", "Aisha B.", "Ngozi O.", "Chidinma K."] },
  { id: 4, block: "Block B", number: "202", beds: 4, occupied: 2, status: "available", students: ["Grace E.", "Blessing I."] },
];

const stats = [
  { label: "Total Beds", value: "230", icon: Bed, color: "from-blue-500 to-blue-600" },
  { label: "Occupied", value: "198", icon: Users, color: "from-emerald-500 to-emerald-600" },
  { label: "Available", value: "32", icon: CheckCircle, color: "from-purple-500 to-purple-600" },
  { label: "Occupancy Rate", value: "86%", icon: Building, color: "from-[var(--accent)] to-emerald-400" },
];

export default function HostelPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Hostel Management</h1>
            <p className="text-white/60">
              Manage blocks, rooms, beds, allocation, and QR attendance
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              <QrCode className="w-4 h-4" />
              QR Attendance
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" />
              Allocate Bed
            </button>
          </div>
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
            <h3 className="text-white font-semibold text-lg">Hostel Blocks</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search blocks..."
                className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {blocks.map((block) => (
              <div key={block.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">{block.name}</h4>
                    <p className="text-white/40 text-xs">{block.type} • {block.rooms} rooms</p>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">{block.status}</span>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/60">Occupancy</span>
                    <span className="text-white/40">{block.occupied}/{block.capacity}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-[var(--accent)] h-2 rounded-full"
                      style={{ width: `${(block.occupied / block.capacity) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs hover:bg-white/10 transition-all">
                    <Eye className="w-3 h-3 inline mr-1" />
                    View
                  </button>
                  <button className="flex-1 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs hover:bg-white/10 transition-all">
                    <Edit className="w-3 h-3 inline mr-1" />
                    Edit
                  </button>
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
            <h3 className="text-white font-semibold text-lg mb-4">Room Status</h3>
            <div className="space-y-3">
              {rooms.map((room) => (
                <div key={room.id} className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{room.block} - Room {room.number}</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      room.status === "full" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {room.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">{room.occupied}/{room.beds} beds</span>
                    <span className="text-white/30">{room.beds - room.occupied} available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Facilities</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Wifi, label: "WiFi", status: "Active" },
                { icon: Thermometer, label: "AC", status: "Active" },
                { icon: AlertCircle, label: "Security", status: "Active" },
                { icon: Building, label: "Water", status: "Active" },
              ].map((facility, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5 flex items-center gap-2">
                  <facility.icon className="w-4 h-4 text-[var(--accent)]" />
                  <div>
                    <p className="text-white text-xs font-medium">{facility.label}</p>
                    <p className="text-white/40 text-[10px]">{facility.status}</p>
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
