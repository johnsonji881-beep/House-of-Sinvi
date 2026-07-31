import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  CreditCard,
  Truck,
  MapPin,
  FileText,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { PurchasePartyDetail } from '../types';

interface PurchasePartyManagerProps {
  parties: PurchasePartyDetail[];
  onAddParty: (party: PurchasePartyDetail) => void;
  onDeleteParty?: (partyId: string) => void;
}

export const PurchasePartyManager: React.FC<PurchasePartyManagerProps> = ({
  parties,
  onAddParty,
  onDeleteParty,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [partyName, setPartyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Silk Mill & Velvet Specialist');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreateParty = (e: React.FormEvent) => {
    e.preventDefault();

    const newParty: PurchasePartyDetail = {
      id: `PRTY-${String(parties.length + 1).padStart(3, '0')}`,
      partyName,
      contactPerson,
      email,
      phone,
      category,
      paymentTerms,
      totalPurchased: 0,
      pendingPayables: 0,
      address,
      notes,
      createdAt: new Date().toISOString(),
    };

    onAddParty(newParty);
    setIsModalOpen(false);

    // Reset Form
    setPartyName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setAddress('');
    setNotes('');
  };

  const filteredParties = parties.filter(
    (p) =>
      p.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              Purchase Party & Supplier Directory
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Procurement Vendors
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-normal">
            Directory of French silk mills, Calais lace houses, Austrian crystal suppliers, and hardware artisans supplying House of SINVI.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Add Purchase Party</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search supplier, contact, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#D4AF37]"
        />
      </div>

      {/* Purchase Parties Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredParties.map((party) => (
          <div
            key={party.id}
            className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4 hover:border-zinc-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {party.id}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                      {party.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mt-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-zinc-400" />
                    <span>{party.partyName}</span>
                  </h3>
                  <p className="text-xs text-zinc-500 font-normal mt-0.5">
                    Contact: <strong className="text-zinc-800">{party.contactPerson}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Terms</span>
                    <span className="text-xs font-semibold text-[#856710]">{party.paymentTerms}</span>
                  </div>
                  {onDeleteParty && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete supplier record for ${party.partyName}?`)) {
                          onDeleteParty(party.id);
                        }
                      }}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl transition-colors"
                      title="Delete Supplier Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-700 pt-1">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{party.email}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{party.phone}</span>
                </div>
                {party.address && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{party.address}</span>
                  </div>
                )}
              </div>

              {party.notes && (
                <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-2xl border border-zinc-200 italic font-normal">
                  "{party.notes}"
                </p>
              )}
            </div>

            {/* Financial Status Bar */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-zinc-100 text-xs bg-zinc-50 p-3 rounded-2xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Purchases</span>
                <span className="font-black text-zinc-900 font-mono">₹{party.totalPurchased.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Pending Payables</span>
                <span className="font-black text-amber-600 font-mono">₹{party.pendingPayables.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Purchase Party Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-zinc-200 shadow-2xl p-6 text-zinc-900 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <h3 className="text-lg font-bold text-zinc-900">Add Purchase Party (Supplier)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 text-sm p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateParty} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Party / Vendor Name
                  </label>
                  <input
                    type="text"
                    required
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="e.g. Maison de Soieries Lyons"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Contact Representative
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Henri Laurent"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="henri@soieries-lyons.fr"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 4 72 10 30 40"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Supplier Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  >
                    <option value="Silk Mill & Velvet Specialist">Silk Mill & Velvet Specialist</option>
                    <option value="Haute Couture Lace House">Haute Couture Lace House</option>
                    <option value="Crystal & Bullion Wire">Crystal & Bullion Wire</option>
                    <option value="Bespoke Buttons & Hardware">Bespoke Buttons & Hardware</option>
                    <option value="Leather Tannery">Leather Tannery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Payment Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Advance / Credit Card">Advance / Credit Card</option>
                    <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  Supplier Address / Country
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 45 Rue Royale, Lyon, France"
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  Material Specialization Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Primary supplier for Mulberry silk velvet and triple organza."
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
                  Save Purchase Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
