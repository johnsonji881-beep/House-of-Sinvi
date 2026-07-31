import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Tag,
  DollarSign,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';
import { ProductDetail } from '../types';

interface ProductManagerProps {
  products: ProductDetail[];
  onAddProduct: (product: ProductDetail) => void;
  onDeleteProduct?: (productId: string) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onSyncProductToSheet: (product: ProductDetail) => void;
  hasSpreadsheet: boolean;
  needsAuth: boolean;
  onLoginPrompt: () => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  onAddProduct,
  onDeleteProduct,
  onUpdateStock,
  onSyncProductToSheet,
  hasSpreadsheet,
  needsAuth,
  onLoginPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductDetail['category']>('Haute Couture Gown');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [purchaseCost, setPurchaseCost] = useState<number>(0);
  const [stockInHand, setStockInHand] = useState<number>(1);
  const [unit, setUnit] = useState('Pieces');
  const [reorderLevel, setReorderLevel] = useState<number>(1);
  const [description, setDescription] = useState('');

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct: ProductDetail = {
      id: `PROD-${String(products.length + 1).padStart(3, '0')}`,
      sku: sku.trim() || `HOS-SKU-${Math.floor(Math.random() * 900 + 100)}`,
      name,
      category,
      sellingPrice,
      purchaseCost,
      stockInHand,
      unit,
      reorderLevel,
      description,
      syncedToSheets: false,
      createdAt: new Date().toISOString(),
    };

    onAddProduct(newProduct);
    setIsModalOpen(false);

    // Reset Form
    setSku('');
    setName('');
    setSellingPrice(0);
    setPurchaseCost(0);
    setStockInHand(1);
    setDescription('');
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalInventoryValue = products.reduce((acc, p) => acc + p.stockInHand * p.purchaseCost, 0);
  const totalRetailValue = products.reduce((acc, p) => acc + p.stockInHand * p.sellingPrice, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161616] rounded-3xl p-6 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Product Details & Atelier Inventory Catalog
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-950/80 text-[#D4AF37] border border-amber-800">
              Garments & Raw Materials
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Catalogue bespoke gowns, tailored suits, raw silk bolts, and crystal embellishments with selling rates and cost prices.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Add Product / Material</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#161616] p-5 rounded-3xl border border-zinc-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Inventory Asset Value (At Cost)</span>
            <Package className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-black text-[#D4AF37] font-mono">
            ₹{totalInventoryValue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-500 font-light">Acquisition cost of all stock in hand</p>
        </div>

        <div className="bg-[#161616] p-5 rounded-3xl border border-zinc-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Potential Retail Realization Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ₹{totalRetailValue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-500 font-light">Estimated revenue if all stock is sold at list price</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#161616] p-4 rounded-3xl border border-zinc-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU or Product Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-xs text-zinc-300 focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="ALL">All Categories</option>
          <option value="Haute Couture Gown">Haute Couture Gown</option>
          <option value="Tailored Suit">Tailored Suit</option>
          <option value="Raw Fabric">Raw Fabric</option>
          <option value="Embellishment">Embellishment</option>
          <option value="Outerwear">Outerwear</option>
          <option value="Accessory">Accessory</option>
        </select>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.map((product) => {
          const margin = product.sellingPrice - product.purchaseCost;
          const marginPercent = product.purchaseCost > 0 ? ((margin / product.sellingPrice) * 100).toFixed(0) : '100';

          return (
            <div
              key={product.id}
              className="bg-[#161616] rounded-3xl border border-zinc-800 p-6 shadow-xl space-y-4 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                        SKU: {product.sku}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800 px-2.5 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-100 mt-2">{product.name}</h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (needsAuth) onLoginPrompt();
                        else onSyncProductToSheet(product);
                      }}
                      className={`p-2 rounded-2xl transition-all ${
                        product.syncedToSheets
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                      }`}
                      title="Sync Product Details to Google Sheet"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    </button>

                    {onDeleteProduct && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete catalog item ${product.name} (SKU: ${product.sku})?`)) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        className="p-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 border border-rose-800/60 rounded-2xl transition-colors"
                        title="Delete Catalog Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 font-light leading-relaxed">{product.description}</p>
              </div>

              {/* Financial & Stock Metrics */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <div className="grid grid-cols-3 gap-2 bg-[#0a0a0a] p-3 rounded-2xl border border-zinc-800/80 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Selling Price</span>
                    <span className="font-bold text-zinc-100 font-mono">₹{product.sellingPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Purchase Cost</span>
                    <span className="font-semibold text-zinc-400 font-mono">₹{product.purchaseCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Margin</span>
                    <span className="font-bold text-emerald-400 font-mono">+{marginPercent}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider">Stock In Hand:</span>
                    <span className="font-bold text-zinc-100 font-mono">
                      {product.stockInHand} {product.unit}
                    </span>
                    {product.stockInHand <= product.reorderLevel && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800 font-bold">
                        <AlertTriangle className="w-3 h-3" /> Reorder Alert
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const newQty = prompt(`Adjust Stock Level for ${product.name}:`, String(product.stockInHand));
                        if (newQty !== null && !isNaN(Number(newQty))) {
                          onUpdateStock(product.id, Math.max(0, Number(newQty)));
                        }
                      }}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-xs"
                    >
                      Update Stock
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-[#161616] border border-zinc-800 shadow-2xl p-6 text-zinc-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-zinc-100">Add Product / Garment / Fabric</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-100 text-sm p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                    Product / Garment Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Imperial Silk Velvet Ballgown"
                    className="w-full p-3 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                    SKU / Product Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. HOS-GOWN-01"
                    className="w-full p-3 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductDetail['category'])}
                    className="w-full p-3 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-100"
                  >
                    <option value="Haute Couture Gown">Haute Couture Gown</option>
                    <option value="Tailored Suit">Tailored Suit</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Raw Fabric">Raw Fabric</option>
                    <option value="Embellishment">Embellishment</option>
                    <option value="Accessory">Accessory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                    Unit Measure
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-3 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-100"
                  >
                    <option value="Pieces">Pieces</option>
                    <option value="Meters">Meters</option>
                    <option value="Yards">Yards</option>
                    <option value="Sets">Sets</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full p-3 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                    Purchase Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(Number(e.target.value))}
                    className="w-full p-3 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                    Stock In Hand
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockInHand}
                    onChange={(e) => setStockInHand(Number(e.target.value))}
                    className="w-full p-3 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                    Reorder Alert Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(Number(e.target.value))}
                    className="w-full p-3 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
                  Product Description / Specifications
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Lyons silk velvet ballgown with metallic bullion embroidery."
                  className="w-full p-3 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-zinc-400 hover:text-zinc-100 font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-bold uppercase tracking-wider rounded-2xl shadow-lg"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
