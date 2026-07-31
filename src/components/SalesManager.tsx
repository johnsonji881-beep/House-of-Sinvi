import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  User,
  ShoppingBag,
  ExternalLink,
  ArrowUpRight,
  Filter,
  Trash2,
} from 'lucide-react';
import { SaleEntry, CustomerDetail, ProductDetail, PaymentStatus } from '../types';

interface SalesManagerProps {
  sales: SaleEntry[];
  customers: CustomerDetail[];
  products: ProductDetail[];
  onAddSale: (newSale: SaleEntry) => void;
  onDeleteSale?: (saleId: string) => void;
  onUpdatePaymentStatus: (saleId: string, status: PaymentStatus, paidAmount: number) => void;
  onSyncSaleToSheet: (sale: SaleEntry) => void;
  hasSpreadsheet: boolean;
  needsAuth: boolean;
  onLoginPrompt: () => void;
}

export const SalesManager: React.FC<SalesManagerProps> = ({
  sales,
  customers,
  products,
  onAddSale,
  onDeleteSale,
  onUpdatePaymentStatus,
  onSyncSaleToSheet,
  hasSpreadsheet,
  needsAuth,
  onLoginPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Sale Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [gstPercentage, setGstPercentage] = useState<number>(18);
  const [paymentMethod, setPaymentMethod] = useState('Bank Wire Transfer');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Partial');
  const [notes, setNotes] = useState('');

  // Handle customer auto fill
  const handleCustomerChange = (custEmailOrId: string) => {
    setSelectedCustomerId(custEmailOrId);
  };

  // Handle product selection auto fill price
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setUnitPrice(prod.sellingPrice);
    }
  };

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();

    const customer = customers.find((c) => c.id === selectedCustomerId);
    const product = products.find((p) => p.id === selectedProductId);

    if (!customer || !product) {
      alert('Please select a valid customer and product.');
      return;
    }

    const subtotal = quantity * unitPrice;
    const gstAmount = (subtotal * gstPercentage) / 100;
    const totalAmount = subtotal + gstAmount;
    const balanceDue = Math.max(0, totalAmount - paidAmount);

    const newSale: SaleEntry = {
      id: `INV-2026-${String(sales.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      items: [
        {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice,
          totalPrice: subtotal,
        },
      ],
      subtotal,
      gstPercentage,
      taxOrDiscount: gstAmount,
      totalAmount,
      paidAmount,
      balanceDue,
      paymentStatus: balanceDue === 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending',
      paymentMethod,
      notes,
      syncedToSheets: false,
      createdAt: new Date().toISOString(),
    };

    onAddSale(newSale);
    setIsModalOpen(false);

    // Reset Form
    setSelectedCustomerId('');
    setSelectedProductId('');
    setQuantity(1);
    setUnitPrice(0);
    setPaidAmount(0);
    setNotes('');
  };

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || s.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Financial Stats
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalCollected = sales.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalReceivables = sales.reduce((acc, s) => acc + s.balanceDue, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              Sale Entries & Billing Ledger
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Sales Accountability
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-normal">
            Record atelier garment sales, track client payments, calculate outstanding balances, and synchronize entries to your Master Google Sheet.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>New Sale Entry</span>
        </button>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Sales Invoiced</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-zinc-900 font-mono">
            ₹{totalSalesRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-400 font-normal">Gross value of all issued client invoices</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Collected Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-400 font-normal">Total cash & wire payments received</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Pending Receivables</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            ₹{totalReceivables.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-400 font-normal">Outstanding balances due from clients</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice # or client..."
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
            <option value="Partial">Partial Deposits</option>
            <option value="Pending">Pending / Unpaid</option>
          </select>
        </div>
      </div>

      {/* Sales Entries List */}
      <div className="space-y-4">
        {filteredSales.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-zinc-300 p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-zinc-400 mx-auto" />
            <h4 className="text-base font-bold text-zinc-800">No Sale Entries Found</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto font-normal">
              Create a new sale entry to log client purchases, record deposits, and track financial balances.
            </p>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4 hover:border-zinc-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#856710] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {sale.id}
                    </span>
                    <span className="text-xs text-zinc-400">{sale.date}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        sale.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : sale.paymentStatus === 'Partial'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {sale.paymentStatus}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 mt-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span>{sale.customerName}</span>
                    <span className="text-xs font-normal text-zinc-500">({sale.customerEmail})</span>
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Total Bill</div>
                    <div className="text-lg font-black text-zinc-900 font-mono">
                      ₹{sale.totalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (needsAuth) onLoginPrompt();
                      else onSyncSaleToSheet(sale);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                      sale.syncedToSheets
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                    }`}
                    title="Sync this Sale Entry to Master Google Sheet Ledger"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{sale.syncedToSheets ? 'Synced' : 'Sync Sheet'}</span>
                  </button>

                  {onDeleteSale && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete sale invoice ${sale.id} for ${sale.customerName}?`)) {
                          onDeleteSale(sale.id);
                        }
                      }}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl transition-all"
                      title="Delete this Sale Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 space-y-2">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Invoiced Garments & Services</div>
                {sale.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-zinc-700">
                    <span className="font-semibold text-zinc-800">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-mono text-zinc-500">
                      ₹{item.unitPrice.toLocaleString('en-IN')} ea = <strong className="text-zinc-900">₹{item.totalPrice.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>
                ))}
              </div>

              {/* Payment Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                <div className="flex items-center gap-4 text-zinc-600">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Paid Deposit:</span>
                    <span className="font-semibold text-emerald-600 font-mono">₹{sale.paidAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Balance Due:</span>
                    <span className="font-semibold text-amber-600 font-mono">₹{sale.balanceDue.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Method:</span>
                    <span className="text-zinc-700">{sale.paymentMethod}</span>
                  </div>
                </div>

                {sale.balanceDue > 0 && (
                  <button
                    onClick={() => {
                      const additional = prompt(
                        `Enter additional payment amount for invoice ${sale.id} (Current Balance Due: ₹${sale.balanceDue.toLocaleString('en-IN')}):`,
                        String(sale.balanceDue)
                      );
                      if (additional && !isNaN(Number(additional))) {
                        const newPaid = sale.paidAmount + Number(additional);
                        const newStatus: PaymentStatus =
                          newPaid >= sale.totalAmount ? 'Paid' : 'Partial';
                        onUpdatePaymentStatus(sale.id, newStatus, newPaid);
                      }
                    }}
                    className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold text-xs rounded-xl transition-all self-start sm:self-auto shadow-sm"
                  >
                    Record Payment Received
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-zinc-200 shadow-2xl p-6 text-zinc-900 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Create New Sale Entry</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  Select Customer / Client
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">-- Select Client --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  Select Product / Garment
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ₹{p.sellingPrice.toLocaleString('en-IN')} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Quantity
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
                    Unit Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
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
                  <span className="text-zinc-500 font-bold uppercase tracking-wider block">Total Bill Calculation:</span>
                  <span className="text-[11px] text-zinc-600">Subtotal: ₹{(quantity * unitPrice).toLocaleString('en-IN')} + GST ({gstPercentage}%): ₹{((quantity * unitPrice * gstPercentage) / 100).toLocaleString('en-IN')}</span>
                </div>
                <span className="text-base font-black text-[#856710] font-mono">
                  ₹{(quantity * unitPrice * (1 + gstPercentage / 100)).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Initial Deposit Received (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={quantity * unitPrice}
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
                    <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                    <option value="Amex Centurion">Amex Centurion</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash / Cheque">Cash / Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  Sale Notes / Instructions
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 50% deposit received. Final payment upon delivery fitting."
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
                  Generate Sale Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
