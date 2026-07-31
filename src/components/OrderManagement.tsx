import React, { useState } from 'react';
import {
  CoutureOrder,
  OrderStatus,
  ClientMeasurements,
  SpreadsheetConfig,
} from '../types';
import {
  Plus,
  Ruler,
  Scissors,
  FileSpreadsheet,
  CheckCircle,
  Calendar,
  Clock,
  DollarSign,
  User,
  Mail,
  Phone,
  Sparkles,
  ChevronRight,
  Search,
  Filter,
  Check,
  Trash2,
} from 'lucide-react';

interface OrderManagementProps {
  orders: CoutureOrder[];
  onAddOrder: (newOrder: CoutureOrder) => void;
  onDeleteOrder?: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateMeasurements: (orderId: string, measurements: ClientMeasurements) => void;
  onSyncToSheetsRequest: (order: CoutureOrder) => void;
  spreadsheetConfig: SpreadsheetConfig | null;
  needsAuth: boolean;
  onLoginPrompt: () => void;
}

const ORDER_STATUSES: OrderStatus[] = [
  'In Consultation',
  'Measurements Recorded',
  'Pattern Drafting',
  'First Fitting',
  'Embroidery & Handwork',
  'Final Fitting',
  'Completed & Delivered',
];

export const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  onAddOrder,
  onDeleteOrder,
  onUpdateOrderStatus,
  onUpdateMeasurements,
  onSyncToSheetsRequest,
  spreadsheetConfig,
  needsAuth,
  onLoginPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMeasurementOrder, setSelectedMeasurementOrder] = useState<CoutureOrder | null>(
    null
  );

  // New Order Form state
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newGarmentName, setNewGarmentName] = useState('');
  const [newCollection, setNewCollection] = useState('Autumn/Winter Haute Couture 2026');
  const [newFabric, setNewFabric] = useState('French Silk Taffeta & Chantilly Lace');
  const [newColorPalette, setNewColorPalette] = useState('Champagne Gold & Midnight');
  const [newPrice, setNewPrice] = useState('18500');
  const [newDeposit, setNewDeposit] = useState('9250');
  const [newDeliveryDate, setNewDeliveryDate] = useState('2026-10-15');
  const [newNotes, setNewNotes] = useState('');

  // Measurement Modal State
  const [editBust, setEditBust] = useState(34);
  const [editWaist, setEditWaist] = useState(26);
  const [editHips, setEditHips] = useState(36);
  const [editShoulderToWaist, setEditShoulderToWaist] = useState(15);
  const [editWaistToFloor, setEditWaistToFloor] = useState(44);
  const [editArmLength, setEditArmLength] = useState(22);
  const [editNeckToShoulder, setEditNeckToShoulder] = useState(5);
  const [editNotes, setEditNotes] = useState('');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.garmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatusFilter === 'ALL' || o.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newGarmentName) return;

    const createdOrder: CoutureOrder = {
      id: `HOS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      clientName: newClientName,
      clientEmail: newClientEmail || 'client@houseofsinvi.com',
      clientPhone: newClientPhone || '+1 (555) 019-2831',
      garmentName: newGarmentName,
      collection: newCollection,
      status: 'In Consultation',
      fabric: newFabric,
      colorPalette: newColorPalette,
      estimatedDelivery: newDeliveryDate,
      price: parseFloat(newPrice) || 12000,
      depositPaid: parseFloat(newDeposit) || 6000,
      measurements: {
        bust: 34,
        waist: 26,
        hips: 36,
        shoulderToWaist: 15,
        waistToFloor: 44,
        armLength: 22,
        neckToShoulder: 5,
        notes: 'Initial fitting scheduled.',
      },
      fittingDates: [newDeliveryDate],
      notes: newNotes,
      syncedToSheets: false,
      createdAt: new Date().toISOString(),
    };

    onAddOrder(createdOrder);
    setIsAddModalOpen(false);
    // Reset form
    setNewClientName('');
    setNewGarmentName('');
    setNewNotes('');
  };

  const openMeasurementModal = (order: CoutureOrder) => {
    setSelectedMeasurementOrder(order);
    setEditBust(order.measurements.bust);
    setEditWaist(order.measurements.waist);
    setEditHips(order.measurements.hips);
    setEditShoulderToWaist(order.measurements.shoulderToWaist);
    setEditWaistToFloor(order.measurements.waistToFloor);
    setEditArmLength(order.measurements.armLength);
    setEditNeckToShoulder(order.measurements.neckToShoulder);
    setEditNotes(order.measurements.notes || '');
  };

  const handleSaveMeasurements = () => {
    if (!selectedMeasurementOrder) return;
    const updated: ClientMeasurements = {
      bust: editBust,
      waist: editWaist,
      hips: editHips,
      shoulderToWaist: editShoulderToWaist,
      waistToFloor: editWaistToFloor,
      armLength: editArmLength,
      neckToShoulder: editNeckToShoulder,
      notes: editNotes,
    };
    onUpdateMeasurements(selectedMeasurementOrder.id, updated);
    setSelectedMeasurementOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-[#161616] rounded-3xl p-6 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Atelier Orders & Measurements
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
              {orders.length} Active Orders
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Track bespoke haute couture garment production, client measurements, and automated Google Sheets sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>New Couture Order</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#161616] p-4 rounded-3xl border border-zinc-800 shadow-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search client, garment or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#0a0a0a] border border-zinc-800 rounded-2xl focus:outline-none focus:border-[#D4AF37] text-zinc-100 placeholder-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider whitespace-nowrap">Filter:</span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs bg-[#0a0a0a] border border-zinc-800 text-zinc-200 rounded-2xl px-3.5 py-2 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="ALL">All Order Stages ({orders.length})</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List / Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-[#161616] rounded-3xl border border-zinc-800 shadow-xl hover:border-zinc-700 transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Order Card Header */}
              <div className="p-6 border-b border-zinc-800/80 bg-[#121212] flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                      {order.id}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">{order.collection}</span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-100 mt-2">
                    {order.garmentName}
                  </h3>
                </div>

                {/* Status Dropdown */}
                <select
                  value={order.status}
                  onChange={(e) =>
                    onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                  }
                  className="text-xs font-semibold px-3 py-1.5 rounded-2xl bg-[#0a0a0a] text-[#D4AF37] border border-zinc-800 focus:border-[#D4AF37] cursor-pointer"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Card Body */}
              <div className="p-6 space-y-4 text-xs text-zinc-300">
                {/* Client Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0a0a0a] p-4 rounded-2xl border border-zinc-800/80">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-zinc-100 font-semibold">
                      <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{order.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{order.clientEmail}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{order.clientPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Est. Delivery: {order.estimatedDelivery}</span>
                    </div>
                  </div>
                </div>

                {/* Fabric & Financial Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block mb-0.5">
                      Fabric Selection
                    </span>
                    <span className="text-zinc-200 font-medium">{order.fabric}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block mb-0.5">
                      Color Palette
                    </span>
                    <span className="text-zinc-200 font-medium">{order.colorPalette}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-2xl border border-zinc-800">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold block">
                      Couture Price
                    </span>
                    <span className="text-zinc-100 font-bold text-base">
                      ₹{order.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">
                      Deposit Received
                    </span>
                    <span className="text-emerald-400 font-bold">
                      ₹{order.depositPaid.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Card Footer & Actions */}
            <div className="p-4 bg-[#121212] border-t border-zinc-800/80 flex items-center justify-between gap-3">
              {/* Measurements Button */}
              <button
                onClick={() => openMeasurementModal(order)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-2xl transition-colors"
              >
                <Ruler className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Body Measurements</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Google Sheets Sync Status Button */}
                {order.syncedToSheets ? (
                  <div className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs font-semibold rounded-2xl">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Synced to Sheet</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (needsAuth) {
                        onLoginPrompt();
                      } else {
                        onSyncToSheetsRequest(order);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] hover:bg-[#c29f2e] text-black text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-black" />
                    <span>Sync to Sheet</span>
                  </button>
                )}

                {onDeleteOrder && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete order #${order.id} for ${order.clientName}?`)) {
                        onDeleteOrder(order.id);
                      }
                    }}
                    className="p-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 border border-rose-800/60 rounded-2xl transition-colors"
                    title="Delete Couture Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ORDER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#161616] rounded-3xl border border-zinc-800 shadow-2xl w-full max-w-2xl my-8 p-6 text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-zinc-100">
                  New Couture Garment Order
                </h3>
                <p className="text-xs text-zinc-400">
                  Register a client bespoke request into the House of SINVI atelier.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-200 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lady Vivienne Sterling"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-zinc-800 rounded-2xl focus:border-[#D4AF37] text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Client Email</label>
                  <input
                    type="email"
                    placeholder="e.g. client@mayfair.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-zinc-800 rounded-2xl focus:border-[#D4AF37] text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+44 20 7946 0912"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-zinc-800 rounded-2xl focus:border-[#D4AF37] text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Garment Name / Vision *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Imperial Silk Velvet Ballgown"
                    value={newGarmentName}
                    onChange={(e) => setNewGarmentName(e.target.value)}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-zinc-800 rounded-2xl focus:border-[#D4AF37] text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Collection</label>
                  <input
                    type="text"
                    value={newCollection}
                    onChange={(e) => setNewCollection(e.target.value)}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-zinc-800 rounded-2xl focus:border-[#D4AF37] text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Fabric & Lace Materials
                  </label>
                  <input
                    type="text"
                    value={newFabric}
                    onChange={(e) => setNewFabric(e.target.value)}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-zinc-800 rounded-2xl focus:border-[#D4AF37] text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Color Palette
                  </label>
                  <input
                    type="text"
                    value={newColorPalette}
                    onChange={(e) => setNewColorPalette(e.target.value)}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-zinc-800 rounded-2xl focus:border-[#D4AF37] text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-zinc-800 rounded-2xl focus:border-[#D4AF37] text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Deposit Paid (₹)
                  </label>
                  <input
                    type="number"
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(e.target.value)}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-zinc-800 rounded-2xl focus:border-[#D4AF37] text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Estimated Delivery
                  </label>
                  <input
                    type="date"
                    value={newDeliveryDate}
                    onChange={(e) => setNewDeliveryDate(e.target.value)}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-zinc-800 rounded-2xl focus:border-[#D4AF37] text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">
                  Atelier & Tailor Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Special handwork instructions, train length, boning, embroidery details..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#0a0a0a] border border-zinc-800 rounded-2xl focus:border-[#D4AF37] text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold uppercase tracking-wider rounded-2xl shadow-md"
                >
                  Create Order Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BODY MEASUREMENTS MODAL */}
      {selectedMeasurementOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#161616] rounded-3xl border border-zinc-800 shadow-2xl w-full max-w-xl p-6 text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-[#D4AF37] text-black">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">
                    Couture Body Measurement Card
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {selectedMeasurementOrder.clientName} — {selectedMeasurementOrder.garmentName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMeasurementOrder(null)}
                className="text-zinc-500 hover:text-zinc-200 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Bust (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editBust}
                    onChange={(e) => setEditBust(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-[#0a0a0a] border border-zinc-800 rounded-xl text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Waist (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editWaist}
                    onChange={(e) => setEditWaist(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-[#0a0a0a] border border-zinc-800 rounded-xl text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Hips (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editHips}
                    onChange={(e) => setEditHips(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-[#0a0a0a] border border-zinc-800 rounded-xl text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Shoulder to Waist
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editShoulderToWaist}
                    onChange={(e) => setEditShoulderToWaist(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-[#0a0a0a] border border-zinc-800 rounded-xl text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Waist to Floor
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editWaistToFloor}
                    onChange={(e) => setEditWaistToFloor(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-[#0a0a0a] border border-zinc-800 rounded-xl text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Arm Length</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editArmLength}
                    onChange={(e) => setEditArmLength(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-[#0a0a0a] border border-zinc-800 rounded-xl text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">
                  Master Tailor Fitting Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#0a0a0a] border border-zinc-800 rounded-xl text-zinc-100"
                  placeholder="Notes regarding shoulder symmetry, hemline drop, boning, lining comfort..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  onClick={() => setSelectedMeasurementOrder(null)}
                  className="px-4 py-2 text-zinc-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMeasurements}
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold uppercase tracking-wider rounded-2xl"
                >
                  Save Measurement Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
