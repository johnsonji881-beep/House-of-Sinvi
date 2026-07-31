import React, { useState } from 'react';
import { SpreadsheetConfig, CoutureOrder } from '../types';
import {
  FileSpreadsheet,
  Plus,
  ExternalLink,
  RefreshCw,
  Table,
  CheckCircle,
  Database,
  Calendar,
  Sparkles,
  Download,
} from 'lucide-react';

interface SheetsLedgerProps {
  spreadsheetConfig: SpreadsheetConfig | null;
  sheetRows: string[][];
  orders: CoutureOrder[];
  onCreateSpreadsheetRequest: () => void;
  onFetchSheetRowsRequest: () => void;
  onAppendManualRowRequest: (row: string[]) => void;
  needsAuth: boolean;
  onLoginPrompt: () => void;
  isLoading: boolean;
}

export const SheetsLedger: React.FC<SheetsLedgerProps> = ({
  spreadsheetConfig,
  sheetRows,
  orders,
  onCreateSpreadsheetRequest,
  onFetchSheetRowsRequest,
  onAppendManualRowRequest,
  needsAuth,
  onLoginPrompt,
  isLoading,
}) => {
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualClient, setManualClient] = useState('');
  const [manualGarment, setManualGarment] = useState('');
  const [manualPrice, setManualPrice] = useState('15000');
  const [manualStatus, setManualStatus] = useState('In Consultation');

  const handleAddManualRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualClient || !manualGarment) return;

    const row = [
      `HOS-MAN-${Math.floor(100 + Math.random() * 900)}`,
      manualClient,
      'vip@houseofsinvi.com',
      '+1 (555) 012-3456',
      manualGarment,
      'Haute Couture Custom',
      manualStatus,
      'Silk Velvet & Organza',
      manualPrice,
      (parseFloat(manualPrice) / 2).toString(),
      new Date().toISOString().split('T')[0],
    ];

    onAppendManualRowRequest(row);
    setShowManualAdd(false);
    setManualClient('');
    setManualGarment('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161616] rounded-3xl p-6 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Master Google Sheet Ledger
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              Sheets Integration
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Real-time synchronization between House of SINVI order records and your official Google Sheets atelier ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!spreadsheetConfig ? (
            <button
              onClick={() => {
                if (needsAuth) onLoginPrompt();
                else onCreateSpreadsheetRequest();
              }}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
              ) : (
                <Plus className="w-4 h-4 text-black" />
              )}
              <span>Create Google Sheet Ledger</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href={spreadsheetConfig.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Google Sheets</span>
              </a>

              <button
                onClick={() => {
                  if (needsAuth) onLoginPrompt();
                  else onFetchSheetRowsRequest();
                }}
                disabled={isLoading}
                className="p-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black rounded-2xl transition-colors"
                title="Refresh Sheet Rows"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Spreadsheet Status Info */}
      {spreadsheetConfig && (
        <div className="bg-[#161616] rounded-3xl border border-zinc-800 p-5 shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-zinc-100">
                Connected Sheet: {spreadsheetConfig.sheetTitle}
              </div>
              <div className="text-zinc-500 text-[11px] font-mono truncate max-w-sm">
                ID: {spreadsheetConfig.spreadsheetId}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <div>
              <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Last Synced
              </span>
              <span className="font-semibold text-zinc-200">
                {spreadsheetConfig.lastSyncedAt
                  ? new Date(spreadsheetConfig.lastSyncedAt).toLocaleTimeString()
                  : 'Just Now'}
              </span>
            </div>

            <button
              onClick={() => setShowManualAdd(!showManualAdd)}
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold rounded-2xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Append Manual Row</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual Append Form */}
      {showManualAdd && (
        <div className="bg-[#161616] rounded-3xl border border-zinc-800 p-6 space-y-4">
          <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Append Direct Ledger Row to Google Sheet
          </h4>
          <form onSubmit={handleAddManualRow} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <input
              type="text"
              required
              placeholder="Client Name"
              value={manualClient}
              onChange={(e) => setManualClient(e.target.value)}
              className="p-3 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-100"
            />
            <input
              type="text"
              required
              placeholder="Garment Description"
              value={manualGarment}
              onChange={(e) => setManualGarment(e.target.value)}
              className="p-3 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-100"
            />
            <input
              type="number"
              placeholder="Price (₹)"
              value={manualPrice}
              onChange={(e) => setManualPrice(e.target.value)}
              className="p-3 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-100"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold uppercase tracking-wider rounded-2xl shadow-md"
            >
              Append to Sheet
            </button>
          </form>
        </div>
      )}

      {/* Live Spreadsheet Grid View */}
      <div className="bg-[#161616] rounded-3xl border border-zinc-800 shadow-xl overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-bold text-zinc-100">
              Live Google Sheets Data Preview
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {sheetRows.length} Total Rows in Ledger
          </span>
        </div>

        {sheetRows.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-xs font-light">
            No rows found in the connected spreadsheet yet. Click "Create Google Sheet Ledger" or "Sync to Google Sheet" on any Couture Order.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0a0a0a] text-[#D4AF37]">
                  {sheetRows[0]?.map((header, i) => (
                    <th key={i} className="p-3.5 font-bold tracking-wider uppercase text-[10px] border-b border-zinc-800 whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {sheetRows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-900/50 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3.5 whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
