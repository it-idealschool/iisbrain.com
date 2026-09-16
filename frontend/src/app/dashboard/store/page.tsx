"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import { createInventoryItem, createItemCategory, getInventoryItems, getItemCategories, InventoryItem, ItemCategory } from "@/lib/inventory";

export default function StorePage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sku: "", name: "", category: "", unit: "piece", stock_quantity: "0", reorder_level: "0", unit_cost: "0", location: "" });

  async function load() {
    const [itemData, categoryData] = await Promise.all([getInventoryItems(), getItemCategories()]);
    setItems(itemData); setCategories(categoryData);
  }
  useEffect(() => { getMe().then(load).catch(() => router.push("/login")); }, [router]);

  async function addCategory() {
    const name = window.prompt("Category name");
    if (!name) return;
    await createItemCategory({ name }); await load();
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); setError("");
    try {
      await createInventoryItem({ ...form, category: Number(form.category) } as unknown as Partial<InventoryItem>);
      setShowForm(false); setForm({ sku: "", name: "", category: "", unit: "piece", stock_quantity: "0", reorder_level: "0", unit_cost: "0", location: "" }); await load();
    } catch { setError("Could not save the inventory item. Check the SKU and required fields."); }
  }

  return <div className="aasr-page">
    <div className="aasr-page-header"><div><p className="aasr-eyebrow">Store Management</p><h1 className="aasr-page-title">Inventory Control</h1><p className="aasr-page-subtitle">Maintain the school item catalogue, stock balance, reorder levels and store locations.</p></div><div className="aasr-actions"><button className="aasr-btn aasr-btn-secondary" onClick={addCategory}>+ Category</button><button className="aasr-btn aasr-btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Item</button></div></div>
    <div className="brain-kpi-grid"><article className="brain-kpi"><span>Total items</span><strong>{items.length}</strong></article><article className="brain-kpi brain-kpi--warning"><span>Low stock</span><strong>{items.filter(i => i.is_low_stock).length}</strong></article><article className="brain-kpi"><span>Categories</span><strong>{categories.length}</strong></article></div>
    {showForm && <form onSubmit={submit} className="brain-panel brain-form-grid">
      <label>SKU<input required value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/></label>
      <label>Item name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label>Category<select required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option value="">Select</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Unit<input value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}/></label>
      <label>Opening stock<input type="number" min="0" step="0.01" value={form.stock_quantity} onChange={e=>setForm({...form,stock_quantity:e.target.value})}/></label>
      <label>Reorder level<input type="number" min="0" step="0.01" value={form.reorder_level} onChange={e=>setForm({...form,reorder_level:e.target.value})}/></label>
      <label>Unit cost (QAR)<input type="number" min="0" step="0.01" value={form.unit_cost} onChange={e=>setForm({...form,unit_cost:e.target.value})}/></label>
      <label>Store location<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label>
      <div className="brain-form-actions"><button className="aasr-btn aasr-btn-primary">Save Item</button></div>
    </form>}
    {error && <p className="brain-error">{error}</p>}
    <section className="aasr-section brain-table-wrap"><table className="aasr-table"><thead><tr><th>SKU</th><th>Item</th><th>Category</th><th>Stock</th><th>Reorder</th><th>Location</th><th>Status</th></tr></thead><tbody>{items.map(i=><tr key={i.id}><td>{i.sku}</td><td><strong>{i.name}</strong></td><td>{i.category_name}</td><td>{i.stock_quantity} {i.unit}</td><td>{i.reorder_level}</td><td>{i.location||"—"}</td><td><span className={`brain-status ${i.is_low_stock?"brain-status--warning":"brain-status--success"}`}>{i.is_low_stock?"Low stock":"Available"}</span></td></tr>)}{!items.length&&<tr><td colSpan={7} className="aasr-empty-state">No inventory items yet. Add categories and the first item.</td></tr>}</tbody></table></section>
  </div>;
}
