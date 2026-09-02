"use client";

import { useEffect, useState } from "react";
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
import { formatCurrency, formatCurrencyCompact } from "@/lib/school-config";

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

const ITEMS_PER_PAGE = 20;

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 16px',
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  color: '#1a1a2e',
  fontSize: '13px',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  color: '#475569',
  fontSize: '13px',
  marginBottom: '6px',
  display: 'block',
};

function btnStyle(bg: string, disabled?: boolean): React.CSSProperties {
  return {
    padding: '8px 16px',
    borderRadius: '12px',
    backgroundColor: bg,
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 500,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  };
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#64748b',
  paddingBottom: '12px',
  paddingLeft: '12px',
  paddingRight: '12px',
};

const tdStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '13px',
  color: '#334155',
};

const statCardGradients: Record<string, React.CSSProperties> = {
  blue: { background: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  green: { background: 'linear-gradient(135deg, #10b981, #059669)' },
  orange: { background: 'linear-gradient(135deg, #f97316, #ea580c)' },
  purple: { background: 'linear-gradient(135deg, #a855f7, #9333ea)' },
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({ total: 0, lowStock: 0, totalValue: 0, categories: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Stationery", quantity: "", unit: "pieces", unitPrice: "", location: "" });
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", category: "", quantity: "", unit: "", unitPrice: "", location: "", status: "" });
  const [showBarcodeScan, setShowBarcodeScan] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeResult, setBarcodeResult] = useState<InventoryItem | null>(null);
  const [page, setPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const allPurchases = items.flatMap((item) =>
    (item.purchases || []).map((p) => ({ ...p, itemName: item.name }))
  );

  const statCards = [
    { label: "Total Items", value: stats.total, icon: Package, gradient: statCardGradients.blue },
    { label: "Categories", value: stats.categories, icon: Warehouse, gradient: statCardGradients.green },
    { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, gradient: statCardGradients.orange },
    { label: "Total Value", value: formatCurrencyCompact(stats.totalValue), icon: TrendingUp, gradient: statCardGradients.purple },
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: '#0055ff', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ background: 'linear-gradient(135deg, #0a2a6e, #0055ff)', borderRadius: '16px', padding: '32px', margin: '32px 16px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '-10%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Inventory Management</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Manage assets, warehouse, purchases, and barcode scanning</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleExport} style={{ ...btnStyle('rgba(255,255,255,0.15)') }}>
                <Download style={{ width: '16px', height: '16px' }} />
                Export
              </button>
              <button onClick={() => setShowBarcodeScan(true)} style={{ ...btnStyle('rgba(255,255,255,0.15)') }}>
                <Barcode style={{ width: '16px', height: '16px' }} />
                Scan
              </button>
              <button onClick={() => setShowModal(true)} style={btnStyle('#0055ff')}>
                <Plus style={{ width: '16px', height: '16px' }} />
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {statCards.map((stat, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>{stat.label}</p>
                <p style={{ fontSize: '30px', fontWeight: 700, color: '#1a1a2e' }}>{stat.value}</p>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', ...stat.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon style={{ width: '24px', height: '24px', color: '#ffffff' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', margin: '0 16px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ color: '#1a1a2e', fontWeight: 600, fontSize: '18px' }}>Inventory Items</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  style={{ ...inputStyle, paddingLeft: '36px', width: '200px' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                />
              </div>
              <button title="Filter using search above" style={{ padding: '8px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Filter style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                  <th style={thStyle}>Item</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Quantity</th>
                  <th style={thStyle}>Unit Price</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{item.name}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: '4px 8px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px' }}>{item.category}</span>
                    </td>
                    <td style={tdStyle}>{item.quantity} {item.unit}</td>
                    <td style={tdStyle}>{formatCurrency(item.unitPrice)}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: item.status === "ok" || item.status === "in_stock" ? "#dcfce7" : "#fee2e2",
                        color: item.status === "ok" || item.status === "in_stock" ? "#16a34a" : "#dc2626",
                      }}>
                        {item.status === "ok" || item.status === "in_stock" ? "In Stock" : "Low Stock"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => setViewItem(item)}
                          style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                        >
                          <Eye style={{ width: '16px', height: '16px' }} />
                        </button>
                        <button
                          onClick={() => {
                            setEditItem(item);
                            setEditForm({
                              name: item.name || "", category: item.category || "",
                              quantity: String(item.quantity ?? ""),
                              unit: item.unit || "", unitPrice: String(item.unitPrice ?? ""),
                              location: item.location || "", status: item.status || "in_stock",
                            });
                          }}
                          style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                        >
                          <Edit style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedItems.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontSize: '13px' }}>No items found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Showing {((safePage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: safePage === 1 ? '#f8fafc' : '#ffffff', color: safePage === 1 ? '#cbd5e1' : '#475569', cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: p === safePage ? '#0055ff' : '#e2e8f0',
                      backgroundColor: p === safePage ? '#0055ff' : '#ffffff',
                      color: p === safePage ? '#ffffff' : '#475569',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: p === safePage ? 600 : 400,
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: safePage === totalPages ? '#f8fafc' : '#ffffff', color: safePage === totalPages ? '#cbd5e1' : '#475569', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={cardStyle}>
            <h3 style={{ color: '#1a1a2e', fontWeight: 600, fontSize: '18px', marginBottom: '16px' }}>Recent Purchases</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allPurchases.slice(0, 4).map((purchase) => (
                <div key={purchase.id} style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#1a1a2e', fontSize: '13px', fontWeight: 500 }}>{purchase.itemName}</span>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: purchase.status === "delivered" ? "#dcfce7" : "rgba(249,115,22,0.2)",
                      color: purchase.status === "delivered" ? "#16a34a" : "#fb923c",
                    }}>
                      {purchase.status}
                    </span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '12px' }}>{purchase.vendor}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px' }}>
                    <span style={{ color: '#94a3b8' }}>{new Date(purchase.date).toLocaleDateString()}</span>
                    <span style={{ color: '#475569' }}>{formatCurrency(purchase.amount)}</span>
                  </div>
                </div>
              ))}
              {allPurchases.length === 0 && (
                <p style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '13px' }}>No purchases yet</p>
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ color: '#1a1a2e', fontWeight: 600, fontSize: '18px', marginBottom: '16px' }}>Warehouse</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { name: "Main Store", items: stats.total },
                { name: "Stationery", items: items.filter((i) => i.category === "Stationery").length },
                { name: "Electronics", items: items.filter((i) => i.category === "Electronics").length },
                { name: "Medical", items: items.filter((i) => i.category === "Medical").length },
              ].map((warehouse, i) => (
                <div key={i} style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                  <Warehouse style={{ width: '24px', height: '24px', color: '#64748b', margin: '0 auto 8px' }} />
                  <p style={{ color: '#1a1a2e', fontSize: '13px', fontWeight: 500 }}>{warehouse.name}</p>
                  <p style={{ color: '#64748b', fontSize: '12px' }}>{warehouse.items} items</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #0a2a6e, #0055ff)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600 }}>Add Inventory Item</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: '20px', height: '20px' }} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Item Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. Whiteboard Markers"
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ ...inputStyle, colorScheme: 'light' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    <option style={{ background: '#ffffff', color: '#1a1a2e' }}>Stationery</option>
                    <option style={{ background: '#ffffff', color: '#1a1a2e' }}>Electronics</option>
                    <option style={{ background: '#ffffff', color: '#1a1a2e' }}>Medical</option>
                    <option style={{ background: '#ffffff', color: '#1a1a2e' }}>Furniture</option>
                    <option style={{ background: '#ffffff', color: '#1a1a2e' }}>Cleaning</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    style={{ ...inputStyle, colorScheme: 'light' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    <option style={{ background: '#ffffff', color: '#1a1a2e' }}>pieces</option>
                    <option style={{ background: '#ffffff', color: '#1a1a2e' }}>boxes</option>
                    <option style={{ background: '#ffffff', color: '#1a1a2e' }}>kits</option>
                    <option style={{ background: '#ffffff', color: '#1a1a2e' }}>units</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Quantity</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. 500"
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Unit Price (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. 250"
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. Main Store"
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, ...btnStyle('#64748b') }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, ...btnStyle('#0055ff', submitting) }}
                >
                  {submitting ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #0a2a6e, #0055ff)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600 }}>{viewItem.name}</h2>
              <button onClick={() => setViewItem(null)} style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: '20px', height: '20px' }} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                  <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Category</p>
                  <p style={{ color: '#1a1a2e', fontSize: '13px', fontWeight: 500 }}>{viewItem.category}</p>
                </div>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                  <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Quantity</p>
                  <p style={{ color: '#1a1a2e', fontSize: '13px', fontWeight: 500 }}>{viewItem.quantity} {viewItem.unit}</p>
                </div>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                  <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Unit Price</p>
                  <p style={{ color: '#1a1a2e', fontSize: '13px', fontWeight: 500 }}>{formatCurrency(viewItem.unitPrice)}</p>
                </div>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                  <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Location</p>
                  <p style={{ color: '#1a1a2e', fontSize: '13px', fontWeight: 500 }}>{viewItem.location}</p>
                </div>
              </div>
              {viewItem.purchases && viewItem.purchases.length > 0 && (
                <div>
                  <h4 style={{ color: '#475569', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Recent Purchases</h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {viewItem.purchases.map((p) => (
                      <div key={p.id} style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#1a1a2e', fontSize: '13px' }}>{p.vendor}</span>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            backgroundColor: p.status === "delivered" ? "#dcfce7" : "rgba(249,115,22,0.2)",
                            color: p.status === "delivered" ? "#16a34a" : "#fb923c",
                          }}>{p.status}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#94a3b8' }}>{new Date(p.date).toLocaleDateString()}</span>
                          <span style={{ color: '#475569' }}>{formatCurrency(p.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #0a2a6e, #0055ff)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600 }}>Edit Inventory Item</h2>
              <button onClick={() => setEditItem(null)} style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: '20px', height: '20px' }} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch("/api/inventory", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: editItem.id, ...editForm, quantity: Number(editForm.quantity), unitPrice: Number(editForm.unitPrice) }),
                });
                if (!res.ok) throw new Error("Failed");
                toast.success("Item updated");
                setEditItem(null);
                fetch("/api/inventory").then(r => r.json()).then(d => setItems(d.items || []));
              } catch { toast.error("Failed to update"); }
            }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input type="text" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <input type="text" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Quantity *</label>
                  <input type="number" min="0" required value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Unit Price</label>
                  <input type="number" min="0" value={editForm.unitPrice} onChange={(e) => setEditForm({ ...editForm, unitPrice: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Unit</label>
                  <input type="text" value={editForm.unit} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ ...inputStyle, colorScheme: 'light' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    <option style={{ background: '#ffffff', color: '#1a1a2e' }} value="in_stock">In Stock</option>
                    <option style={{ background: '#ffffff', color: '#1a1a2e' }} value="low_stock">Low Stock</option>
                    <option style={{ background: '#ffffff', color: '#1a1a2e' }} value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button type="button" onClick={() => setEditItem(null)} style={btnStyle('#64748b')}>Cancel</button>
                <button type="submit" style={btnStyle('#0055ff')}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBarcodeScan && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => { setShowBarcodeScan(false); setBarcodeResult(null); setBarcodeInput(""); }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, #0a2a6e, #0055ff)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600 }}>Barcode Scanner</h2>
              <button onClick={() => { setShowBarcodeScan(false); setBarcodeResult(null); setBarcodeInput(""); }} style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: '20px', height: '20px' }} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <input
                type="text"
                autoFocus
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && barcodeInput.trim()) {
                    const found = items.find(i => i.name.toLowerCase().includes(barcodeInput.toLowerCase()) || i.id === barcodeInput.trim());
                    setBarcodeResult(found || null);
                    if (!found) toast.error("Item not found for barcode: " + barcodeInput);
                  }
                }}
                placeholder="Scan or type barcode..."
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#0055ff'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
              />
              <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>Press Enter to search</p>
              {barcodeResult && (
                <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ color: '#1a1a2e', fontWeight: 500, fontSize: '14px' }}>{barcodeResult.name}</p>
                  <p style={{ color: '#64748b', fontSize: '13px' }}>Category: {barcodeResult.category}</p>
                  <p style={{ color: '#64748b', fontSize: '13px' }}>Qty: {barcodeResult.quantity} {barcodeResult.unit}</p>
                  <p style={{ color: '#64748b', fontSize: '13px' }}>{formatCurrency(barcodeResult.unitPrice)}</p>
                  <p style={{ color: '#64748b', fontSize: '13px' }}>Location: {barcodeResult.location}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
