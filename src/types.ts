export type OrderStatus = 'In Consultation' | 'Measurements Recorded' | 'Pattern Drafting' | 'First Fitting' | 'Embroidery & Handwork' | 'Final Fitting' | 'Completed & Delivered';

export interface ClientMeasurements {
  bust: number; // in inches
  waist: number;
  hips: number;
  shoulderToWaist: number;
  waistToFloor: number;
  armLength: number;
  neckToShoulder: number;
  notes?: string;
}

export interface CoutureOrder {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  garmentName: string; // e.g. "Elysian Silk Velvet Evening Gown"
  collection: string; // e.g. "Autumn/Winter Haute Couture 2026"
  status: OrderStatus;
  fabric: string; // e.g. "Italian Silk Organza & French Lace"
  colorPalette: string; // e.g. "Champagne Gold & Deep Midnight"
  estimatedDelivery: string; // YYYY-MM-DD
  price: number; // USD
  depositPaid: number; // USD
  measurements: ClientMeasurements;
  fittingDates: string[];
  notes: string;
  syncedToSheets?: boolean;
  sheetsRowIndex?: number;
  sourceFormResponseId?: string;
  createdAt: string;
}

export interface WorkspaceForm {
  formId: string;
  title: string;
  description: string;
  responderUri: string;
  editUri?: string;
  createdAt: string;
  responseCount: number;
}

export interface FormResponseItem {
  responseId: string;
  createTime: string;
  clientName: string;
  clientEmail: string;
  garmentType: string;
  budgetRange: string;
  eventDate: string;
  specialRequests: string;
  rawAnswers: Record<string, string>;
  convertedToOrder?: boolean;
}

export interface SpreadsheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetTitle: string;
  lastSyncedAt?: string;
}

export interface DriveFolderConfig {
  folderId: string;
  folderUrl: string;
  folderName: string;
}

// Commerce & Accountability Types

export type PaymentStatus = 'Paid' | 'Partial' | 'Pending' | 'Overdue';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleEntry {
  id: string; // e.g. "INV-2026-001"
  date: string; // YYYY-MM-DD
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: SaleItem[];
  subtotal: number;
  gstPercentage?: number; // e.g. 18
  taxOrDiscount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string; // Cash, Wire, Card, Amex, Check
  notes?: string;
  syncedToSheets?: boolean;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseEntry {
  id: string; // e.g. "PO-2026-101"
  date: string; // YYYY-MM-DD
  partyId: string;
  partyName: string;
  partyEmail: string;
  items: PurchaseItem[];
  gstPercentage?: number; // e.g. 18
  totalCost: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  notes?: string;
  syncedToSheets?: boolean;
  createdAt: string;
}

export interface CustomerDetail {
  id: string; // e.g. "CUST-001"
  name: string;
  email: string;
  phone: string;
  companyOrTitle?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  pendingReceivables: number;
  measurements?: ClientMeasurements;
  status: 'VIP Active' | 'Regular' | 'Lead';
  createdAt: string;
}

export interface PurchasePartyDetail {
  id: string; // e.g. "PRTY-001"
  partyName: string; // Vendor / Supplier Name
  contactPerson: string;
  email: string;
  phone: string;
  category: string; // Silk Mill, Crystal Supplier, Lace House, Hardware, Leather Tannery
  paymentTerms: string; // Net 30, Advance, COD, Net 15
  totalPurchased: number;
  pendingPayables: number;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface ProductDetail {
  id: string; // e.g. "PROD-001"
  sku: string;
  name: string;
  category: 'Haute Couture Gown' | 'Tailored Suit' | 'Outerwear' | 'Raw Fabric' | 'Embellishment' | 'Accessory';
  sellingPrice: number;
  purchaseCost: number;
  stockInHand: number;
  unit: string; // Meters, Pieces, Yards, Sets
  reorderLevel: number;
  description: string;
  syncedToSheets?: boolean;
  createdAt: string;
}

export interface AccountabilityAuditLog {
  id: string;
  timestamp: string;
  actionType: 'SALE' | 'PURCHASE' | 'STOCK_ADJUSTMENT' | 'PAYMENT_RECEIVED' | 'PAYMENT_MADE';
  entityId: string;
  amount: number;
  description: string;
  performedBy: string;
}

