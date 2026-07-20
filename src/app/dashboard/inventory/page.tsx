"use client";

import { useEffect, useState } from "react";
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
  Loader2,
  Download,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

interface InventoryPurchase {
  id: string;
  vendor: string;
  quantity: number;
  amount: number;
  date: string;
  status: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  status: string;
  location: string;
  purchases: InventoryPurchase[];
}

interface InventoryStats {
  total: number;
  lowStock: number;
  totalValue: number;
  categories: number;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({ total: 0, lowStock: 0, totalValue: 0, categories: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Stationery", quantity: "", unit: "pieces", unitPrice: "", location: "" });
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setItems(data.items || []);
      setStats(data.stats || { total: 0, lowStock: 0, totalValue: 0, categories: 0 });
    } catch {
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.quantity || !form.unitPrice) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          quantity: parseInt(form.quantity),
          unit: form.unit,
          unitPrice: parseFloat(form.unitPrice),
          location: form.location,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Item added successfully");
      setShowModal(false);
      setForm({ name: "", category: "Stationery", quantity: "", unit: "pieces", unitPrice: "", location: "" });
      fetchData();
    } catch {
      toast.error("Failed to add item");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const allPurchases = items.flatMap((item) =>
    (item.purchases || []).map((p) => ({ ...p, itemName: item.name }))
  );

  const statCards = [
    { label: "Total Items", value: stats.total, icon: Package, color: "from-blue-500 to-blue-600" },
    { label: "Categories", value: stats.categories, icon: Warehouse, color: "from-emerald-500 to-emerald-600" },
    { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, color: "from-orange-500 to-orange-600" },
    { label: "Total Value", value: `₦${(stats.totalValue / 1000).toFixed(0)}K`, icon: TrendingUp, color: "from-purple-500 to-purple-600" },
  ];

  const handleExport = () => {
    const data = items.map((item) => ({
      Name: item.name,
      Category: item.category,
      Quantity: item.quantity,
      Unit: item.unit,
      "Unit Price": item.unitPrice,
      Location: item.location,
      Status: item.status,
    }));
    downloadCSV(data, "inventory_data");
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
            <h1 className="text-2xl font-bold text-white mb-1">Inventory Management</h1>
            <p className="text-white/60 text-[13px]">
              Manage assets, warehouse, purchases, and barcode scanning
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
            <button
              onClick={() => toast.info("Barcode scanner coming soon")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-[13px] font-medium hover:bg-white/[0.1] transition-all duration-200"
            >
              <Barcode className="w-4 h-4" />
              Scan
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all duration-200 shadow-lg shadow-[var(--primary)]/25"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
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
            <h3 className="text-white font-semibold text-lg">Inventory Items</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search items..."
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
                  <th className="text-left text-white/50 text-[13px] font-medium pb-3">Item</th>
                  <th className="text-left text-white/50 text-[13px] font-medium pb-3">Category</th>
                  <th className="text-left text-white/50 text-[13px] font-medium pb-3">Quantity</th>
                  <th className="text-left text-white/50 text-[13px] font-medium pb-3">Unit Price</th>
                  <th className="text-left text-white/50 text-[13px] font-medium pb-3">Status</th>
                  <th className="text-left text-white/50 text-[13px] font-medium pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-all">
                    <td className="py-3 text-white font-medium text-[13px]">{item.name}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-lg bg-white/[0.08] text-white/70 text-[12px]">{item.category}</span>
                    </td>
                    <td className="py-3 text-white/70 text-[13px]">{item.quantity} {item.unit}</td>
                    <td className="py-3 text-white/70 text-[13px]">₦{item.unitPrice.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                        item.status === "ok" || item.status === "in_stock" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {item.status === "ok" || item.status === "in_stock" ? "In Stock" : "Low Stock"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setViewItem(item)}
                          className="p-1 rounded-lg hover:bg-white/[0.08] text-white/40"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toast.info("Edit item coming soon")}
                          className="p-1 rounded-lg hover:bg-white/[0.08] text-white/40"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-white/40 text-[13px]">No items found</td>
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
            <h3 className="text-white font-semibold text-lg mb-4">Recent Purchases</h3>
            <div className="space-y-3">
              {allPurchases.slice(0, 4).map((purchase) => (
                <div key={purchase.id} className="p-3 rounded-xl bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-[13px] font-medium">{purchase.itemName}</span>
                    <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                      purchase.status === "delivered" ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                    }`}>
                      {purchase.status}
                    </span>
                  </div>
                  <p className="text-white/40 text-[12px]">{purchase.vendor}</p>
                  <div className="flex items-center justify-between mt-2 text-[12px]">
                    <span className="text-white/30">{new Date(purchase.date).toLocaleDateString()}</span>
                    <span className="text-white/60">₦{purchase.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {allPurchases.length === 0 && (
                <p className="text-center py-4 text-white/40 text-[13px]">No purchases yet</p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Warehouse</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Main Store", items: stats.total, status: "ok" },
                { name: "Stationery", items: items.filter((i) => i.category === "Stationery").length, status: "ok" },
                { name: "Electronics", items: items.filter((i) => i.category === "Electronics").length, status: "ok" },
                { name: "Medical", items: items.filter((i) => i.category === "Medical").length, status: "ok" },
              ].map((warehouse, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.04] text-center">
                  <Warehouse className="w-6 h-6 text-white/40 mx-auto mb-2" />
                  <p className="text-white text-[13px] font-medium">{warehouse.name}</p>
                  <p className="text-white/40 text-[12px]">{warehouse.items} items</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">Add Inventory Item</h2>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Item Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. Whiteboard Markers"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 text-[13px] mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ colorScheme: "dark" }}
                    className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option style={{ background: "#0f1b33", color: "#fff" }}>Stationery</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }}>Electronics</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }}>Medical</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }}>Furniture</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }}>Cleaning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1">Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    style={{ colorScheme: "dark" }}
                    className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option style={{ background: "#0f1b33", color: "#fff" }}>pieces</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }}>boxes</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }}>kits</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }}>units</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 text-[13px] mb-1">Quantity</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g. 500"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1">Unit Price (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g. 250"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. Main Store"
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Add Item"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">{viewItem.name}</h2>
              <button onClick={() => setViewItem(null)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-white/40 text-[12px] mb-1">Category</p>
                  <p className="text-white text-[13px] font-medium">{viewItem.category}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-white/40 text-[12px] mb-1">Quantity</p>
                  <p className="text-white text-[13px] font-medium">{viewItem.quantity} {viewItem.unit}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-white/40 text-[12px] mb-1">Unit Price</p>
                  <p className="text-white text-[13px] font-medium">₦{viewItem.unitPrice.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-white/40 text-[12px] mb-1">Location</p>
                  <p className="text-white text-[13px] font-medium">{viewItem.location}</p>
                </div>
              </div>
              {viewItem.purchases && viewItem.purchases.length > 0 && (
                <div>
                  <h4 className="text-white/60 text-[13px] font-medium mb-3">Recent Purchases</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {viewItem.purchases.map((p) => (
                      <div key={p.id} className="p-3 rounded-xl bg-white/[0.04]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-[13px]">{p.vendor}</span>
                          <span className={`px-2 py-1 rounded-lg text-[12px] ${
                            p.status === "delivered" ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                          }`}>{p.status}</span>
                        </div>
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-white/30">{new Date(p.date).toLocaleDateString()}</span>
                          <span className="text-white/60">₦{p.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
