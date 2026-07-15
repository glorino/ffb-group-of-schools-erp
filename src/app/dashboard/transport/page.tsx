"use client";

import { motion } from "framer-motion";
import {
  Bus,
  MapPin,
  Users,
  Plus,
  Search,
  Navigation,
  Fuel,
  Wrench,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Edit,
} from "lucide-react";

const vehicles = [
  { id: 1, name: "Bus A1", plate: "LAG-123-AB", capacity: 45, assigned: 38, driver: "Mr. Chukwuemeka", route: "Mainland Express", status: "active", fuel: 75 },
  { id: 2, name: "Bus A2", plate: "LAG-456-CD", capacity: 45, assigned: 42, driver: "Mr. Olumide", route: "Island Circuit", status: "active", fuel: 60 },
  { id: 3, name: "Bus B1", plate: "LAG-789-EF", capacity: 30, assigned: 25, driver: "Mr. Abubakar", route: " Ikeja Route", status: "active", fuel: 85 },
  { id: 4, name: "Van C1", plate: "LAG-321-GH", capacity: 15, assigned: 12, driver: "Mr. Tunde", route: "Lekki Phase 1", status: "maintenance", fuel: 40 },
];

const routes = [
  { name: "Mainland Express", stops: 8, students: 156, time: "45 mins", status: "active" },
  { name: "Island Circuit", stops: 6, students: 142, time: "35 mins", status: "active" },
  { name: "Ikeja Route", stops: 10, students: 128, time: "50 mins", status: "active" },
  { name: "Lekki Phase 1", stops: 5, students: 85, time: "30 mins", status: "active" },
];

const stats = [
  { label: "Total Vehicles", value: "12", icon: Bus, color: "from-blue-500 to-blue-600" },
  { label: "Active Routes", value: "8", icon: MapPin, color: "from-emerald-500 to-emerald-600" },
  { label: "Students Transported", value: "511", icon: Users, color: "from-purple-500 to-purple-600" },
  { label: "On-Time Rate", value: "94%", icon: Clock, color: "from-[var(--accent)] to-emerald-400" },
];

export default function TransportPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Transport Management</h1>
            <p className="text-white/60">
              Manage vehicles, routes, drivers, and GPS tracking
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              <Navigation className="w-4 h-4" />
              GPS Tracking
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" />
              Add Vehicle
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
            <h3 className="text-white font-semibold text-lg">Vehicle Fleet</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search vehicles..."
                className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  vehicle.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                }`}>
                  <Bus className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">{vehicle.name}</p>
                    <span className="text-white/30 text-xs">{vehicle.plate}</span>
                  </div>
                  <p className="text-white/40 text-xs">{vehicle.driver} • {vehicle.route}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{vehicle.assigned}/{vehicle.capacity}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <Fuel className="w-3 h-3 text-white/40" />
                    <span className="text-white/40 text-xs">{vehicle.fuel}%</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 rounded-lg hover:bg-white/10 text-white/40">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 text-white/40">
                    <Edit className="w-4 h-4" />
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
            <h3 className="text-white font-semibold text-lg mb-4">Routes</h3>
            <div className="space-y-3">
              {routes.map((route, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{route.name}</span>
                    <span className="text-[var(--accent)] text-xs">{route.students} students</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">{route.stops} stops • {route.time}</span>
                    <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400">{route.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">GPS Live Map</h3>
            <div className="aspect-video rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
              <MapPin className="w-12 h-12 text-white/20 mb-2" />
              <p className="text-white/40 text-sm">Live GPS tracking</p>
              <p className="text-white/30 text-xs">12 vehicles online</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
