import React from 'react';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  SaleEntry,
  PurchaseEntry,
  CustomerDetail,
  PurchasePartyDetail,
  ProductDetail,
  AccountabilityAuditLog,
  SpreadsheetConfig,
} from '../types';

interface AccountabilityDashboardProps {
  sales: SaleEntry[];
  purchases: PurchaseEntry[];
  customers: CustomerDetail[];
  parties: PurchasePartyDetail[];
  products: ProductDetail[];
  auditLogs: AccountabilityAuditLog[];
  spreadsheetConfig: SpreadsheetConfig | null;
  onSyncAllToSheet: () => void;
  isLoading: boolean;
  needsAuth: boolean;
  onLoginPrompt: () => void;
}

export const AccountabilityDashboard: React.FC<AccountabilityDashboardProps> = ({
  sales,
  purchases,
  customers,
  parties,
  products,
  auditLogs,
  spreadsheetConfig,
  onSyncAllToSheet,
  isLoading,
  needsAuth,
  onLoginPrompt,
}) => {
  // Financial Calculations
  const totalInvoicedSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalSalesCollected = sales.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalReceivables = sales.reduce((sum, s) => sum + s.balanceDue, 0);

  const totalPurchaseExpenses = purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalPurchasesPaid = purchases.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalPayables = purchases.reduce((sum, p) => sum + p.balanceDue, 0);

  const netAccrualGrossProfit = totalInvoicedSales - totalPurchaseExpenses;
  const netCashInHand = totalSalesCollected - totalPurchasesPaid;
  const inventoryValue = products.reduce((sum, p) => sum + p.stockInHand * p.purchaseCost, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161616] rounded-3xl p-6 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Financial & Operational Accountability Center
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
              Audit & Ledger Summary
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Complete financial accountability for House of SINVI Atelier — sales revenue, purchase expenses, receivables, payables, stock value, and audit logs.
          </p>
        </div>

        <button
          onClick={() => {
            if (needsAuth) onLoginPrompt();
            else onSyncAllToSheet();
          }}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-black" />
          <span>Sync All Data to Google Sheet</span>
        </button>
      </div>

      {/* Main Financial Accountability Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Accrual Margin */}
        <div className="bg-[#161616] p-6 rounded-3xl border border-zinc-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Net Gross Margin</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            ₹{netAccrualGrossProfit.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-500 font-light">
            Invoiced Sales (₹{totalInvoicedSales.toLocaleString('en-IN')}) - Purchases (₹{totalPurchaseExpenses.toLocaleString('en-IN')})
          </p>
        </div>

        {/* Net Cash In Hand */}
        <div className="bg-[#161616] p-6 rounded-3xl border border-zinc-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Net Collected Cash Flow</span>
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-3xl font-black text-[#D4AF37] font-mono">
            ₹{netCashInHand.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-500 font-light">
            Collected Cash (₹{totalSalesCollected.toLocaleString('en-IN')}) - Settled Suppliers (₹{totalPurchasesPaid.toLocaleString('en-IN')})
          </p>
        </div>

        {/* Pending Client Receivables */}
        <div className="bg-[#161616] p-6 rounded-3xl border border-zinc-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Client Receivables</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">
            ₹{totalReceivables.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-500 font-light">
            Outstanding balance owed across {sales.filter((s) => s.balanceDue > 0).length} client invoices
          </p>
        </div>

        {/* Pending Supplier Payables */}
        <div className="bg-[#161616] p-6 rounded-3xl border border-zinc-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Supplier Payables</span>
            <ArrowDownRight className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-blue-400 font-mono">
            ₹{totalPayables.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-500 font-light">
            Unpaid invoices owed across {purchases.filter((p) => p.balanceDue > 0).length} suppliers
          </p>
        </div>
      </div>

      {/* Detailed Operational Breakdown Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sales & Client Overview */}
        <div className="bg-[#161616] rounded-3xl border border-zinc-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Sales & Clients</span>
            </h3>
            <span className="text-xs font-mono text-zinc-400">{sales.length} Invoices</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 bg-[#0a0a0a] rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-400">Total Invoiced Sales:</span>
              <span className="font-bold text-zinc-100 font-mono">₹{totalInvoicedSales.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-3 bg-[#0a0a0a] rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-400">Cash Received / Deposits:</span>
              <span className="font-bold text-emerald-400 font-mono">₹{totalSalesCollected.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-3 bg-[#0a0a0a] rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-400">Active VIP Clients:</span>
              <span className="font-bold text-zinc-100">{customers.length} Clients</span>
            </div>
          </div>
        </div>

        {/* Purchases & Suppliers Overview */}
        <div className="bg-[#161616] rounded-3xl border border-zinc-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>Purchases & Vendors</span>
            </h3>
            <span className="text-xs font-mono text-zinc-400">{purchases.length} POs</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 bg-[#0a0a0a] rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-400">Total Material Purchases:</span>
              <span className="font-bold text-zinc-100 font-mono">₹{totalPurchaseExpenses.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-3 bg-[#0a0a0a] rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-400">Settled Supplier Bills:</span>
              <span className="font-bold text-emerald-400 font-mono">₹{totalPurchasesPaid.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-3 bg-[#0a0a0a] rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-400">Registered Purchase Parties:</span>
              <span className="font-bold text-zinc-100">{parties.length} Vendors</span>
            </div>
          </div>
        </div>

        {/* Products & Inventory Value */}
        <div className="bg-[#161616] rounded-3xl border border-zinc-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D4AF37]" />
              <span>Stock & Inventory</span>
            </h3>
            <span className="text-xs font-mono text-zinc-400">{products.length} Products</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 bg-[#0a0a0a] rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-400">Inventory Stock Value:</span>
              <span className="font-bold text-[#D4AF37] font-mono">₹{inventoryValue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-3 bg-[#0a0a0a] rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-400">Low Stock Reorder Items:</span>
              <span className="font-bold text-amber-400 font-mono">
                {products.filter((p) => p.stockInHand <= p.reorderLevel).length} Items
              </span>
            </div>
            <div className="flex justify-between p-3 bg-[#0a0a0a] rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-400">Google Sheet Connection:</span>
              <span className="font-bold text-emerald-400">
                {spreadsheetConfig ? 'Connected' : 'Not Provisioned'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Accountability Audit Logs Trail */}
      <div className="bg-[#161616] rounded-3xl border border-zinc-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
              Recent Financial & Stock Audit Log
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Real-time Accountability Feed</span>
        </div>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 bg-[#0a0a0a] rounded-2xl border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    log.actionType === 'SALE'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : log.actionType === 'PURCHASE'
                      ? 'bg-blue-950 text-blue-400 border-blue-800'
                      : 'bg-amber-950 text-amber-400 border-amber-800'
                  }`}
                >
                  {log.actionType}
                </span>
                <span className="text-zinc-200 font-medium">{log.description}</span>
              </div>

              <div className="flex items-center gap-4 text-zinc-500 shrink-0">
                <span className="font-mono text-zinc-100 font-bold">₹{log.amount.toLocaleString('en-IN')}</span>
                <span className="text-[11px] font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
