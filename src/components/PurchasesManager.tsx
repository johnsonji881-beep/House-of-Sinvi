import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Building2,
  Package,
  TrendingDown,
  Filter,
  Trash2,
} from 'lucide-react';
import { PurchaseEntry, PurchasePartyDetail, ProductDetail, PaymentStatus } from '../types';

interface PurchasesManagerProps {
  purchases: PurchaseEntry[];
  parties: PurchasePartyDetail[];
  products: ProductDetail[];
  onAddPurchase: (newPurchase: PurchaseEntry) => void;
  onDeletePurchase?: (purchaseId: string) => void;
  onUpdatePaymentStatus: (purchaseId: string, status: PaymentStatus, paidAmount: number) => void;
  onSyncPurchaseToSheet: (purchase: PurchaseEntry) => void;
  hasSpreadsheet: boolean;
  needsAuth: boolean;
  onLoginPrompt: () => void;
}

export const PurchasesManager: React.FC<PurchasesManagerProps> = ({
  purchases,
  parties,
  products,
  onAddPurchase,
  onDeletePurchase,
  onUpdatePaymentStatus,
  onSyncPurchaseToSheet,
  hasSpreadsheet,
  needsAuth,
  onLoginPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Purchase Form State
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [gstPercentage, setGstPercentage] = useState<number>(18);
  const [paymentMethod, setPaymentMethod] = useState('SWIFT International Wire');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const handlePartyChange = (partyId: string) => {
    setSelectedPartyId(partyId);
  };

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    if (prodId === 'CUSTOM') {
      setCustomItemName('');
      setUnitCost(0);
    } else {
      const prod = products.find((p) => p.id === prodId);
      if (prod) {
        setCustomItemName(prod.name);
        setUnitCost(prod.purchaseCost);
      }
    }
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();

    const party = parties.find((p) => p.id === selectedPartyId);
    if (!party) {
      alert('Please select a valid Purchase Party (Supplier).');
      return;
    }

    const itemName = customItemName.trim() || 'Raw Materials & Trimmings';
    const subtotal = quantity * unitCost;
    const gstAmount = (subtotal * gstPercentage) / 100;
    const totalCost = subtotal + gstAmount;
    const balanceDue = Math.max(0, totalCost - paidAmount);

    const newPurchase: PurchaseEntry = {
      id: `PO-2026-${String(purchases.length + 101).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      partyId: party.id,
      partyName: party.partyName,
      partyEmail: party.email,
      items: [
        {
          productId: selectedProductId || 'RAW-MAT',
          productName: itemName,
          quantity,
          unitCost,
          totalCost: subtotal,
        },
      ],
      gstPercentage,
      totalCost,
      paidAmount,
      balanceDue,
      paymentStatus: balanceDue === 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending',
      paymentMethod,
      notes,
      syncedToSheets: false,
      createdAt: new Date().toISOString(),
    };

    onAddPurchase(newPurchase);
    setIsModalOpen(false);

    // Reset Form
    setSelectedPartyId('');
    setSelectedProductId('');
    setCustomItemName('');
    setQuantity(1);
    setUnitCost(0);
    setPaidAmount(0);
    setNotes('');
  };

  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || p.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Financial Stats
  const totalPurchaseCost = purchases.reduce((acc, p) => acc + p.totalCost, 0);
  const totalPaidToSuppliers = purchases.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalPayablesDue = purchases.reduce((acc, p) => acc + p.balanceDue, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              Purchase Entries & Supplier Expense Ledger
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Procurement & Payables
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-normal">
            Record material acquisitions from silk mills, crystal houses, and lace suppliers. Track outstanding supplier payables and synchronize to Google Sheets.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>New Purchase Entry</span>
        </button>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Purchase Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-zinc-900 font-mono">
            ₹{totalPurchaseCost.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-400 font-normal">Total procurement cost committed to suppliers</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Paid to Suppliers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            ₹{totalPaidToSuppliers.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-400 font-normal">Total settled supplier invoices</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Outstanding Payables</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            ₹{totalPayablesDue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-400 font-normal">Unpaid balances owed to purchase parties</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PO # or Purchase Party..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-700 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Paid">Paid Only</option>
            <option value="Partial">Partial Payments</option>
            <option value="Pending">Pending / Unpaid</option>
          </select>
        </div>
      </div>

      {/* Purchases Entries List */}
      <div className="space-y-4">
        {filteredPurchases.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-zinc-300 p-12 text-center space-y-3">
            <Truck className="w-10 h-10 text-zinc-400 mx-auto" />
            <h4 className="text-base font-bold text-zinc-800">No Purchase Entries Recorded</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto font-normal">
              Log raw material purchases, silk shipments, and crystal orders from suppliers.
            </p>
          </div>
        ) : (
          filteredPurchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4 hover:border-zinc-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {purchase.id}
                    </span>
                    <span className="text-xs text-zinc-400">{purchase.date}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        purchase.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : purchase.paymentStatus === 'Partial'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {purchase.paymentStatus}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 mt-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-zinc-400" />
                    <span>{purchase.partyName}</span>
                    <span className="text-xs font-normal text-zinc-500">({purchase.partyEmail})</span>
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Total PO Value</div>
                    <div className="text-lg font-black text-zinc-900 font-mono">
                      ₹{purchase.totalCost.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (needsAuth) onLoginPrompt();
                      else onSyncPurchaseToSheet(purchase);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                      purchase.syncedToSheets
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                    }`}
                    title="Sync Purchase Entry to Google Sheet"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{purchase.syncedToSheets ? 'Synced' : 'Sync Sheet'}</span>
                  </button>

                  {onDeletePurchase && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete purchase order ${purchase.id} for ${purchase.partyName}?`)) {
                          onDeletePurchase(purchase.id);
                        }
                      }}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl transition-all"
                      title="Delete Purchase Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 space-y-2">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Purchased Materials & Fabrics</div>
                {purchase.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-zinc-700">
                    <span className="font-semibold text-zinc-800">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-mono text-zinc-500">
                      ₹{item.unitCost.toLocaleString('en-IN')} ea = <strong className="text-zinc-900">₹{item.totalCost.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>
                ))}
              </div>

              {/* Payment Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                <div className="flex items-center gap-4 text-zinc-600">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Paid to Party:</span>
                    <span className="font-semibold text-emerald-600 font-mono">₹{purchase.paidAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Balance Payable:</span>
                    <span className="font-semibold text-amber-600 font-mono">₹{purchase.balanceDue.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Method:</span>
                    <span className="text-zinc-700">{purchase.paymentMethod}</span>
                  </div>
                </div>

                {purchase.balanceDue > 0 && (
                  <button
                    onClick={() => {
                      const additional = prompt(
                        `Enter payment amount paid to supplier for PO ${purchase.id} (Current Payable: ₹${purchase.balanceDue.toLocaleString('en-IN')}):`,
                        String(purchase.balanceDue)
                      );
                      if (additional && !isNaN(Number(additional))) {
                        const newPaid = purchase.paidAmount + Number(additional);
                        const newStatus: PaymentStatus =
                          newPaid >= purchase.totalCost ? 'Paid' : 'Partial';
                        onUpdatePaymentStatus(purchase.id, newStatus, newPaid);
                      }
                    }}
                    className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold text-xs rounded-xl transition-all self-start sm:self-auto shadow-sm"
                  >
                    Record Payment to Supplier
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-zinc-200 shadow-2xl p-6 text-zinc-900 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Record New Purchase Entry</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  Select Purchase Party (Supplier)
                </label>
                <select
                  required
                  value={selectedPartyId}
                  onChange={(e) => handlePartyChange(e.target.value)}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">-- Select Supplier --</option>
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.partyName} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  Select Product / Raw Material
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">-- Select Catalog Item or Custom --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - Cost: ₹{p.purchaseCost.toLocaleString('en-IN')}
                    </option>
                  ))}
                  <option value="CUSTOM">+ Custom Fabric / Trim Acquisition</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  Material Name / Specification
                </label>
                <input
                  type="text"
                  required
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="e.g. Lyons Silk Velvet (Emerald), Chantilly Lace yardage"
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Quantity Purchased
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Unit Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={gstPercentage}
                    onChange={(e) => setGstPercentage(Number(e.target.value))}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider block">Total Purchase Commitment:</span>
                  <span className="text-[11px] text-zinc-600">Subtotal: ₹{(quantity * unitCost).toLocaleString('en-IN')} + GST ({gstPercentage}%): ₹{((quantity * unitCost * gstPercentage) / 100).toLocaleString('en-IN')}</span>
                </div>
                <span className="text-base font-black text-blue-700 font-mono">
                  ₹{(quantity * unitCost * (1 + gstPercentage / 100)).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Amount Paid Now (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={quantity * unitCost}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  >
                    <option value="SWIFT International Wire">SWIFT International Wire</option>
                    <option value="Net 30 Bank Transfer">Net 30 Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash / Cheque">Cash / Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  PO Notes / Delivery Details
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Shipment dispatched via DHL Express to Paris Atelier."
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-zinc-500 hover:text-zinc-800 font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold uppercase tracking-wider rounded-2xl shadow-md"
                >
                  Issue Purchase Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
