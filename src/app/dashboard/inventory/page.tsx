"use client";

import { motion } from "framer-motion";
import {
  Package,
  Warehouse,
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Barcode,
  Truck,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  TrendingUp,
} from "lucide-react";

const inventory = [
  { id: 1, name: "Whiteboard Markers", category: "Stationery", quantity: 500, minStock: 100, unit: "pieces", status: "ok" },
  { id: 2, name: "Exercise Books", category: "Stationery", quantity: 2000, minStock: 500, unit: "pieces", status: "ok" },
  { id: 3, name: "Chalk", category: "Stationery", quantity: 80, minStock: 100, unit: "boxes", status: "low" },
  { id: 4, name: "Projector Bulbs", category: "Electronics", quantity: 15, minStock: 10, unit: "pieces", status: "ok" },
  { id: 5, name: "First Aid Kits", category: "Medical", quantity: 8, minStock: 5, unit: "kits", status: "ok" },
];

const purchases = [
  { id: 1, item: "Whiteboard Markers", vendor: "Lagos Stationery Hub", quantity: 200, amount: "₦45,000", date: "Jan 10, 2025", status: "delivered" },
  { id: 2, item: "Exercise Books", vendor: "ABC Paper Mills", quantity: 1000, amount: "₦120,000", date: "Jan 8, 2025", status: "delivered" },
  { id: 3, item: "Chalk", vendor: "Classmate Supplies", quantity: 50, amount: "₦15,000", date: "Jan 12, 2025", status: "pending" },
];

const stats = [
  { label: "Total Items", value: "2,603", icon: Package, color: "from-blue-500 to-blue-600" },
  { label: "Categories", value: "12", icon: Warehouse, color: "from-emerald-500 to-emerald-600" },
  { label: "Low Stock", value: "3", icon: AlertTriangle, color: "from-orange-500 to-orange-600" },
  { label: "Monthly Spend", value: "₦180K", icon: TrendingUp, color: "from-purple-500 to-purple-600" },
];

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Inventory Management</h1>
            <p className="text-white/60">
              Manage assets, warehouse, purchases, and barcode scanning
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              <Barcode className="w-4 h-4" />
              Scan
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" />
              Add Item
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
            <h3 className="text-white font-semibold text-lg">Inventory Items</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search items..."
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
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Item</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Category</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Quantity</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Min Stock</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Status</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="py-3 text-white font-medium text-sm">{item.name}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-lg bg-white/10 text-white/70 text-xs">{item.category}</span>
                    </td>
                    <td className="py-3 text-white/70 text-sm">{item.quantity} {item.unit}</td>
                    <td className="py-3 text-white/70 text-sm">{item.minStock}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        item.status === "ok" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {item.status === "ok" ? "In Stock" : "Low Stock"}
                      </span>
                    </td>
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
            <h3 className="text-white font-semibold text-lg mb-4">Recent Purchases</h3>
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{purchase.item}</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      purchase.status === "delivered" ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                    }`}>
                      {purchase.status}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs">{purchase.vendor}</p>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-white/30">{purchase.date}</span>
                    <span className="text-white/60">{purchase.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Warehouse</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Main Store", items: 1500, status: "ok" },
                { name: "Stationery", items: 800, status: "ok" },
                { name: "Electronics", items: 45, status: "ok" },
                { name: "Medical", items: 58, status: "ok" },
              ].map((warehouse, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5 text-center">
                  <Warehouse className="w-6 h-6 text-white/40 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">{warehouse.name}</p>
                  <p className="text-white/40 text-xs">{warehouse.items} items</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
