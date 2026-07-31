import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building,
  Ruler,
  ShoppingBag,
  DollarSign,
  Crown,
  Edit2,
  MapPin,
  Trash2,
} from 'lucide-react';
import { CustomerDetail, ClientMeasurements } from '../types';

interface CustomerManagerProps {
  customers: CustomerDetail[];
  onAddCustomer: (customer: CustomerDetail) => void;
  onUpdateCustomer: (customer: CustomerDetail) => void;
  onDeleteCustomer?: (customerId: string) => void;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerForView, setSelectedCustomerForView] = useState<CustomerDetail | null>(null);

  // Customer Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyOrTitle, setCompanyOrTitle] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'VIP Active' | 'Regular' | 'Lead'>('VIP Active');

  // Measurements
  const [bust, setBust] = useState(34);
  const [waist, setWaist] = useState(26);
  const [hips, setHips] = useState(36);
  const [shoulderToWaist, setShoulderToWaist] = useState(15);
  const [waistToFloor, setWaistToFloor] = useState(44);
  const [armLength, setArmLength] = useState(22);
  const [neckToShoulder, setNeckToShoulder] = useState(5);
  const [measurementNotes, setMeasurementNotes] = useState('');

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();

    const measurements: ClientMeasurements = {
      bust,
      waist,
      hips,
      shoulderToWaist,
      waistToFloor,
      armLength,
      neckToShoulder,
      notes: measurementNotes,
    };

    const newCustomer: CustomerDetail = {
      id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      name,
      email,
      phone,
      companyOrTitle,
      address,
      totalOrders: 0,
      totalSpent: 0,
      pendingReceivables: 0,
      status,
      measurements,
      createdAt: new Date().toISOString(),
    };

    onAddCustomer(newCustomer);
    setIsModalOpen(false);

    // Reset Form
    setName('');
    setEmail('');
    setPhone('');
    setCompanyOrTitle('');
    setAddress('');
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.companyOrTitle && c.companyOrTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              Customer & Client Directory
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
              VIP Client Accountability
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-normal">
            Comprehensive directory of haute couture clientele, measurement cards, historical spending accountability, and communication records.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by client name, email, or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#D4AF37]"
        />
      </div>

      {/* Customer Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4 hover:border-zinc-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                      {cust.id}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        cust.status === 'VIP Active'
                          ? 'bg-[#D4AF37]/10 text-[#856710] border-[#D4AF37]/30'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}
                    >
                      {cust.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mt-2 flex items-center gap-2">
                    {cust.status === 'VIP Active' && <Crown className="w-4 h-4 text-[#D4AF37]" />}
                    <span>{cust.name}</span>
                  </h3>
                  {cust.companyOrTitle && (
                    <p className="text-xs text-zinc-500 font-normal flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{cust.companyOrTitle}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedCustomerForView(cust)}
                    className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl transition-colors"
                    title="View Body Measurements Profile"
                  >
                    <Ruler className="w-4 h-4 text-[#856710]" />
                  </button>
                  {onDeleteCustomer && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete customer record for ${cust.name}?`)) {
                          onDeleteCustomer(cust.id);
                        }
                      }}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl transition-colors"
                      title="Delete Customer Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-700 pt-1">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{cust.email}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{cust.phone}</span>
                </div>
                {cust.address && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{cust.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-100 text-xs bg-zinc-50 p-3 rounded-2xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Orders</span>
                <span className="font-bold text-zinc-900">{cust.totalOrders}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Spent</span>
                <span className="font-black text-emerald-600 font-mono">₹{cust.totalSpent.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Receivables</span>
                <span className="font-black text-amber-600 font-mono">₹{cust.pendingReceivables.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Measurements Drawer/Modal */}
      {selectedCustomerForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-zinc-200 shadow-2xl p-6 text-zinc-900 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{selectedCustomerForView.name}</h3>
                <p className="text-xs text-zinc-500 font-normal">Client Bespoke Measurement Profile</p>
              </div>
              <button
                onClick={() => setSelectedCustomerForView(null)}
                className="text-zinc-400 hover:text-zinc-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            {selectedCustomerForView.measurements ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200 font-mono text-zinc-800">
                  <div>
                    <span className="text-zinc-500 font-bold uppercase text-[10px] block">Bust</span>
                    <span>{selectedCustomerForView.measurements.bust}"</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold uppercase text-[10px] block">Waist</span>
                    <span>{selectedCustomerForView.measurements.waist}"</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold uppercase text-[10px] block">Hips</span>
                    <span>{selectedCustomerForView.measurements.hips}"</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold uppercase text-[10px] block">Shoulder-Waist</span>
                    <span>{selectedCustomerForView.measurements.shoulderToWaist}"</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold uppercase text-[10px] block">Waist-Floor</span>
                    <span>{selectedCustomerForView.measurements.waistToFloor}"</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold uppercase text-[10px] block">Arm Length</span>
                    <span>{selectedCustomerForView.measurements.armLength}"</span>
                  </div>
                </div>

                {selectedCustomerForView.measurements.notes && (
                  <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-zinc-700 italic font-normal">
                    "{selectedCustomerForView.measurements.notes}"
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No measurement card recorded yet for this client.</p>
            )}

            <div className="flex justify-end pt-3 border-t border-zinc-200">
              <button
                onClick={() => setSelectedCustomerForView(null)}
                className="px-5 py-2.5 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider rounded-2xl"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-zinc-200 shadow-2xl p-6 text-zinc-900 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <h3 className="text-lg font-bold text-zinc-900">Add New VIP Client</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 text-sm p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lady Vivienne Sterling"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="v.sterling@mayfair.co.uk"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 20 7946 0912"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Company / Title
                  </label>
                  <input
                    type="text"
                    value={companyOrTitle}
                    onChange={(e) => setCompanyOrTitle(e.target.value)}
                    placeholder="e.g. Baroness / Art Patron"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  Client Address / City
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mayfair, London, UK"
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                />
              </div>

              {/* Body Measurements Card Input */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3">
                <div className="text-zinc-500 font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#856710]" />
                  <span>Initial Bespoke Body Measurements (Inches)</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Bust:</span>
                    <input
                      type="number"
                      step="0.1"
                      value={bust}
                      onChange={(e) => setBust(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-zinc-200 rounded-xl font-mono text-zinc-900"
                    />
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Waist:</span>
                    <input
                      type="number"
                      step="0.1"
                      value={waist}
                      onChange={(e) => setWaist(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-zinc-200 rounded-xl font-mono text-zinc-900"
                    />
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Hips:</span>
                    <input
                      type="number"
                      step="0.1"
                      value={hips}
                      onChange={(e) => setHips(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-zinc-200 rounded-xl font-mono text-zinc-900"
                    />
                  </div>
                </div>
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
                  Save Client Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
