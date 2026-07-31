import React from 'react';
import { User } from 'firebase/auth';
import {
  Sparkles,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  HardDrive,
  LogOut,
  CheckCircle2,
  Lock,
  ShoppingBag,
  Truck,
  Users,
  Building2,
  Package,
  PieChart,
} from 'lucide-react';

export type ActiveTabType =
  | 'orders'
  | 'sales'
  | 'purchases'
  | 'customers'
  | 'parties'
  | 'products'
  | 'accountability'
  | 'forms'
  | 'sheets'
  | 'drive';

interface HeaderProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  user: User | null;
  needsAuth: boolean;
  onLogin: () => void;
  onLogout: () => void;
  hasSpreadsheet: boolean;
  hasForm: boolean;
  hasDriveFolder: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  needsAuth,
  onLogin,
  onLogout,
  hasSpreadsheet,
  hasForm,
  hasDriveFolder,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white text-zinc-900 border-b border-zinc-200 shadow-sm backdrop-blur-md">
      {/* Top Banner & Atelier Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b38e24] text-black font-black flex items-center justify-center text-xl shadow-md border border-amber-400/50">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl tracking-tighter uppercase font-bold text-zinc-900">
                House of <span className="font-serif italic font-normal text-[#9A7B1C]">SINVI</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest bg-amber-50 text-[#856710] border border-amber-200">
                Atelier Operations
              </span>
            </div>
            <p className="text-xs text-zinc-500 tracking-wide font-normal">
              Commerce, Procurement, Customer & Financial Accountability Suite
            </p>
          </div>
        </div>

        {/* Integration Status Badges & Auth Button */}
        <div className="flex items-center gap-3">
          {/* Quick Integration Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
              Sync:
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  hasSpreadsheet
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-zinc-100 text-zinc-400'
                }`}
                title="Google Sheets Ledger Status"
              >
                <FileSpreadsheet className="w-3 h-3" />
                Sheets
              </span>
              <span
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  hasForm
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-zinc-100 text-zinc-400'
                }`}
                title="Google Forms Intake Status"
              >
                <FileText className="w-3 h-3" />
                Forms
              </span>
              <span
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  hasDriveFolder
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-zinc-100 text-zinc-400'
                }`}
                title="Google Drive Spec Folder Status"
              >
                <HardDrive className="w-3 h-3" />
                Drive
              </span>
            </div>
          </div>

          {/* User Sign In / Profile */}
          {user ? (
            <div className="flex items-center gap-3 bg-zinc-50 pl-2 pr-3 py-1.5 rounded-2xl border border-zinc-200">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google Account'}
                  className="w-7 h-7 rounded-xl border border-[#D4AF37] object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-xl bg-[#D4AF37] text-black font-bold text-xs flex items-center justify-center">
                  {user.email?.[0].toUpperCase() || 'G'}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-zinc-800 truncate max-w-[130px]">
                  {user.displayName || user.email}
                </div>
                <div className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Workspace Active
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1 text-zinc-400 hover:text-zinc-800 transition-colors"
                title="Sign out of Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-black" />
              <span>Connect Workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-zinc-50 border-t border-zinc-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'sales'
                ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Sale Entry</span>
          </button>

          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'purchases'
                ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Purchase Entry</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'customers'
                ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer Details</span>
          </button>

          <button
            onClick={() => setActiveTab('parties')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'parties'
                ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Purchase Party Entry</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Details</span>
          </button>

          <button
            onClick={() => setActiveTab('accountability')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'accountability'
                ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Accountability Dashboard</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-300 mx-1 shrink-0" />

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Couture Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('forms')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'forms'
                ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Google Forms</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'sheets'
                ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Master Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'drive'
                ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Drive Specs</span>
          </button>
        </div>
      </div>
    </header>
  );
};

