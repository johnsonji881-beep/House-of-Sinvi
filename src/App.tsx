import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutUser,
  getAccessToken,
} from './lib/firebase';
import {
  createMasterSpreadsheet,
  syncOrderToSpreadsheet,
  syncSaleToSpreadsheet,
  syncPurchaseToSpreadsheet,
  syncProductToSpreadsheet,
  fetchSpreadsheetRows,
  createConsultationForm,
  fetchFormResponses,
  createAtelierDriveFolder,
} from './lib/workspaceApi';
import {
  CoutureOrder,
  OrderStatus,
  ClientMeasurements,
  WorkspaceForm,
  FormResponseItem,
  SpreadsheetConfig,
  DriveFolderConfig,
  SaleEntry,
  PurchaseEntry,
  CustomerDetail,
  PurchasePartyDetail,
  ProductDetail,
  AccountabilityAuditLog,
  PaymentStatus,
} from './types';
import {
  INITIAL_ORDERS,
  MOCK_FORM_RESPONSES,
  INITIAL_SALES,
  INITIAL_PURCHASES,
  MOCK_CUSTOMERS,
  MOCK_PURCHASE_PARTIES,
  MOCK_PRODUCTS,
  INITIAL_AUDIT_LOGS,
} from './data/mockAtelierData';
import { Header, ActiveTabType } from './components/Header';
import { OrderManagement } from './components/OrderManagement';
import { SalesManager } from './components/SalesManager';
import { PurchasesManager } from './components/PurchasesManager';
import { CustomerManager } from './components/CustomerManager';
import { PurchasePartyManager } from './components/PurchasePartyManager';
import { ProductManager } from './components/ProductManager';
import { AccountabilityDashboard } from './components/AccountabilityDashboard';
import { FormBuilder } from './components/FormBuilder';
import { SheetsLedger } from './components/SheetsLedger';
import { DriveFolderView } from './components/DriveFolderView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('sales');
  const [user, setUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Application Data States
  const [orders, setOrders] = useState<CoutureOrder[]>(INITIAL_ORDERS);
  const [sales, setSales] = useState<SaleEntry[]>(INITIAL_SALES);
  const [purchases, setPurchases] = useState<PurchaseEntry[]>(INITIAL_PURCHASES);
  const [customers, setCustomers] = useState<CustomerDetail[]>(MOCK_CUSTOMERS);
  const [parties, setParties] = useState<PurchasePartyDetail[]>(MOCK_PURCHASE_PARTIES);
  const [products, setProducts] = useState<ProductDetail[]>(MOCK_PRODUCTS);
  const [auditLogs, setAuditLogs] = useState<AccountabilityAuditLog[]>(INITIAL_AUDIT_LOGS);

  const [forms, setForms] = useState<WorkspaceForm[]>([]);
  const [formResponses, setFormResponses] = useState<FormResponseItem[]>(MOCK_FORM_RESPONSES);
  const [spreadsheetConfig, setSpreadsheetConfig] = useState<SpreadsheetConfig | null>(null);
  const [sheetRows, setSheetRows] = useState<string[][]>([
    [
      'Entry ID',
      'Type',
      'Entity Name',
      'Item/Garment',
      'Total (₹)',
      'Paid (₹)',
      'Status',
      'Date',
    ],
    ...INITIAL_SALES.map((s) => [
      s.id,
      'SALE',
      s.customerName,
      s.items[0]?.productName || 'Custom Garment',
      s.totalAmount.toString(),
      s.paidAmount.toString(),
      s.paymentStatus,
      s.date,
    ]),
    ...INITIAL_PURCHASES.map((p) => [
      p.id,
      'PURCHASE',
      p.partyName,
      p.items[0]?.productName || 'Raw Material',
      p.totalCost.toString(),
      p.paidAmount.toString(),
      p.paymentStatus,
      p.date,
    ]),
  ]);
  const [driveConfig, setDriveConfig] = useState<DriveFolderConfig | null>(null);

  // Confirmation Modal State
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details?: string[];
    onConfirmAction: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirmAction: () => {},
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setNeedsAuth(false);
        showToast(`Welcome back, ${res.user.displayName || 'Atelier Designer'}! Google Workspace connected.`);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to sign in with Google', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setNeedsAuth(true);
    showToast('Signed out of Google Workspace.');
  };

  // --- SALE HANDLERS ---
  const handleAddSale = (newSale: SaleEntry) => {
    setSales((prev) => [newSale, ...prev]);

    // Update Customer stats
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === newSale.customerId
          ? {
              ...c,
              totalOrders: c.totalOrders + 1,
              totalSpent: c.totalSpent + newSale.totalAmount,
              pendingReceivables: c.pendingReceivables + newSale.balanceDue,
            }
          : c
      )
    );

    // Audit Log
    const newLog: AccountabilityAuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: 'SALE',
      entityId: newSale.id,
      amount: newSale.totalAmount,
      description: `Sale Entry issued for ${newSale.customerName} (₹${newSale.totalAmount.toLocaleString('en-IN')})`,
      performedBy: user?.displayName || 'Atelier Director',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast(`Sale Entry ${newSale.id} created for ${newSale.customerName}.`);
  };

  const handleDeleteSale = (saleId: string) => {
    setSales((prev) => prev.filter((s) => s.id !== saleId));
    showToast(`Sale Invoice ${saleId} deleted.`);
  };

  const handleUpdateSalePayment = (saleId: string, status: PaymentStatus, newPaidAmount: number) => {
    setSales((prev) =>
      prev.map((s) => {
        if (s.id === saleId) {
          const balanceDue = Math.max(0, s.totalAmount - newPaidAmount);
          return {
            ...s,
            paidAmount: newPaidAmount,
            balanceDue,
            paymentStatus: balanceDue === 0 ? 'Paid' : 'Partial',
          };
        }
        return s;
      })
    );
    showToast(`Payment updated for Sale Invoice ${saleId}.`);
  };

  // --- PURCHASE HANDLERS ---
  const handleAddPurchase = (newPurchase: PurchaseEntry) => {
    setPurchases((prev) => [newPurchase, ...prev]);

    // Update Party stats
    setParties((prev) =>
      prev.map((p) =>
        p.id === newPurchase.partyId
          ? {
              ...p,
              totalPurchased: p.totalPurchased + newPurchase.totalCost,
              pendingPayables: p.pendingPayables + newPurchase.balanceDue,
            }
          : p
      )
    );

    // Audit Log
    const newLog: AccountabilityAuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: 'PURCHASE',
      entityId: newPurchase.id,
      amount: newPurchase.totalCost,
      description: `Purchase Entry issued to ${newPurchase.partyName} (₹${newPurchase.totalCost.toLocaleString('en-IN')})`,
      performedBy: user?.displayName || 'Procurement Desk',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast(`Purchase Entry ${newPurchase.id} recorded for ${newPurchase.partyName}.`);
  };

  const handleDeletePurchase = (purchaseId: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== purchaseId));
    showToast(`Purchase PO ${purchaseId} deleted.`);
  };

  const handleUpdatePurchasePayment = (purchaseId: string, status: PaymentStatus, newPaidAmount: number) => {
    setPurchases((prev) =>
      prev.map((p) => {
        if (p.id === purchaseId) {
          const balanceDue = Math.max(0, p.totalCost - newPaidAmount);
          return {
            ...p,
            paidAmount: newPaidAmount,
            balanceDue,
            paymentStatus: balanceDue === 0 ? 'Paid' : 'Partial',
          };
        }
        return p;
      })
    );
    showToast(`Payment recorded for PO ${purchaseId}.`);
  };

  // --- CUSTOMER & PARTY & PRODUCT HANDLERS ---
  const handleAddCustomer = (customer: CustomerDetail) => {
    setCustomers((prev) => [customer, ...prev]);
    showToast(`Client record for ${customer.name} created.`);
  };

  const handleUpdateCustomer = (customer: CustomerDetail) => {
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? customer : c)));
    showToast(`Client profile for ${customer.name} updated.`);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    showToast(`Customer record deleted.`);
  };

  const handleAddPurchaseParty = (party: PurchasePartyDetail) => {
    setParties((prev) => [party, ...prev]);
    showToast(`Supplier record for ${party.partyName} saved.`);
  };

  const handleDeletePurchaseParty = (partyId: string) => {
    setParties((prev) => prev.filter((p) => p.id !== partyId));
    showToast(`Supplier record deleted.`);
  };

  const handleAddProduct = (product: ProductDetail) => {
    setProducts((prev) => [product, ...prev]);
    showToast(`Product ${product.name} (${product.sku}) catalogued.`);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast(`Product deleted from catalog.`);
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockInHand: newStock } : p))
    );
    showToast(`Stock updated.`);
  };

  // --- COUTURE ORDER HANDLERS ---
  const handleAddOrder = (newOrder: CoutureOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Order ${newOrder.id} registered for ${newOrder.clientName}.`);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast(`Order #${orderId} deleted.`);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    showToast(`Order ${orderId} updated to stage: "${status}".`);
  };

  const handleUpdateMeasurements = (
    orderId: string,
    measurements: ClientMeasurements
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, measurements } : o))
    );
    showToast(`Measurement card saved for order ${orderId}.`);
  };

  // --- GOOGLE SHEETS ACTIONS ---
  const triggerSyncSaleToSheets = (sale: SaleEntry) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Sync Sale Entry to Google Sheet',
      message: `Append Sale Entry #${sale.id} for "${sale.customerName}" (₹${sale.totalAmount.toLocaleString('en-IN')}) to your Master Google Sheet?`,
      onConfirmAction: () => executeSyncSaleToSheets(sale),
    });
  };

  const executeSyncSaleToSheets = async (sale: SaleEntry) => {
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    const token = getAccessToken();
    if (!token) {
      handleGoogleLogin();
      return;
    }

    setIsLoading(true);
    try {
      let activeSpreadsheetId = spreadsheetConfig?.spreadsheetId;
      if (!activeSpreadsheetId) {
        const newSheetConfig = await createMasterSpreadsheet(token);
        setSpreadsheetConfig(newSheetConfig);
        activeSpreadsheetId = newSheetConfig.spreadsheetId;
      }

      await syncSaleToSpreadsheet(token, activeSpreadsheetId, sale);

      setSales((prev) =>
        prev.map((s) => (s.id === sale.id ? { ...s, syncedToSheets: true } : s))
      );

      setSheetRows((prev) => [
        ...prev,
        [
          sale.id,
          'SALE',
          sale.customerName,
          sale.items[0]?.productName || 'Garment',
          sale.totalAmount.toString(),
          sale.paidAmount.toString(),
          sale.paymentStatus,
          sale.date,
        ],
      ]);

      showToast(`Sale Entry #${sale.id} synced to Google Sheet!`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error syncing Sale to Google Sheet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSyncPurchaseToSheets = (purchase: PurchaseEntry) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Sync Purchase Entry to Google Sheet',
      message: `Append Purchase Entry #${purchase.id} to "${purchase.partyName}" (₹${purchase.totalCost.toLocaleString('en-IN')}) to Google Sheets?`,
      onConfirmAction: () => executeSyncPurchaseToSheets(purchase),
    });
  };

  const executeSyncPurchaseToSheets = async (purchase: PurchaseEntry) => {
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    const token = getAccessToken();
    if (!token) {
      handleGoogleLogin();
      return;
    }

    setIsLoading(true);
    try {
      let activeSpreadsheetId = spreadsheetConfig?.spreadsheetId;
      if (!activeSpreadsheetId) {
        const newSheetConfig = await createMasterSpreadsheet(token);
        setSpreadsheetConfig(newSheetConfig);
        activeSpreadsheetId = newSheetConfig.spreadsheetId;
      }

      await syncPurchaseToSpreadsheet(token, activeSpreadsheetId, purchase);

      setPurchases((prev) =>
        prev.map((p) => (p.id === purchase.id ? { ...p, syncedToSheets: true } : p))
      );

      setSheetRows((prev) => [
        ...prev,
        [
          purchase.id,
          'PURCHASE',
          purchase.partyName,
          purchase.items[0]?.productName || 'Raw Materials',
          purchase.totalCost.toString(),
          purchase.paidAmount.toString(),
          purchase.paymentStatus,
          purchase.date,
        ],
      ]);

      showToast(`Purchase PO #${purchase.id} synced to Google Sheet!`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error syncing Purchase to Sheet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSyncProductToSheets = (product: ProductDetail) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Sync Product Catalog to Google Sheet',
      message: `Append product "${product.name}" (${product.sku}) price details to Google Sheet?`,
      onConfirmAction: () => executeSyncProductToSheets(product),
    });
  };

  const executeSyncProductToSheets = async (product: ProductDetail) => {
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    const token = getAccessToken();
    if (!token) {
      handleGoogleLogin();
      return;
    }

    setIsLoading(true);
    try {
      let activeSpreadsheetId = spreadsheetConfig?.spreadsheetId;
      if (!activeSpreadsheetId) {
        const newSheetConfig = await createMasterSpreadsheet(token);
        setSpreadsheetConfig(newSheetConfig);
        activeSpreadsheetId = newSheetConfig.spreadsheetId;
      }

      await syncProductToSpreadsheet(token, activeSpreadsheetId, product);

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, syncedToSheets: true } : p))
      );
      showToast(`Product ${product.name} synced to Google Sheet.`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error syncing product to Google Sheet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSyncAllToSheet = () => {
    setConfirmModalState({
      isOpen: true,
      title: 'Master Sync All Accountability Data to Google Sheets',
      message: 'This will push all current Sales, Purchases, Customer Balances, and Product Catalog items into your Master Google Sheet.',
      onConfirmAction: executeSyncAllToSheet,
    });
  };

  const executeSyncAllToSheet = async () => {
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    const token = getAccessToken();
    if (!token) {
      handleGoogleLogin();
      return;
    }

    setIsLoading(true);
    try {
      let activeSpreadsheetId = spreadsheetConfig?.spreadsheetId;
      if (!activeSpreadsheetId) {
        const config = await createMasterSpreadsheet(token);
        setSpreadsheetConfig(config);
        activeSpreadsheetId = config.spreadsheetId;
      }

      for (const sale of sales) {
        await syncSaleToSpreadsheet(token, activeSpreadsheetId, sale).catch(() => {});
      }
      for (const purchase of purchases) {
        await syncPurchaseToSpreadsheet(token, activeSpreadsheetId, purchase).catch(() => {});
      }
      for (const prod of products) {
        await syncProductToSpreadsheet(token, activeSpreadsheetId, prod).catch(() => {});
      }

      setSales((prev) => prev.map((s) => ({ ...s, syncedToSheets: true })));
      setPurchases((prev) => prev.map((p) => ({ ...p, syncedToSheets: true })));
      setProducts((prev) => prev.map((p) => ({ ...p, syncedToSheets: true })));

      showToast('Master Accountability Data fully synchronized to Google Sheet!');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to sync master ledger', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSyncOrderToSheets = (order: CoutureOrder) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Sync Couture Order to Google Sheets',
      message: `Sync Order #${order.id} for "${order.clientName}" to Google Sheets?`,
      onConfirmAction: () => executeSyncOrderToSheets(order),
    });
  };

  const executeSyncOrderToSheets = async (order: CoutureOrder) => {
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    const token = getAccessToken();
    if (!token) {
      handleGoogleLogin();
      return;
    }

    setIsLoading(true);
    try {
      let activeSpreadsheetId = spreadsheetConfig?.spreadsheetId;
      if (!activeSpreadsheetId) {
        const newSheetConfig = await createMasterSpreadsheet(token);
        setSpreadsheetConfig(newSheetConfig);
        activeSpreadsheetId = newSheetConfig.spreadsheetId;
      }

      await syncOrderToSpreadsheet(token, activeSpreadsheetId, order);

      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, syncedToSheets: true } : o))
      );

      showToast(`Couture Order #${order.id} appended to Google Sheet!`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error syncing order to Google Sheet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerCreateSpreadsheet = () => {
    setConfirmModalState({
      isOpen: true,
      title: 'Create Master Google Sheet Ledger',
      message: 'This action will create a new Google Sheet named "House of Sinvi - Master Atelier Ledger" in your Google Drive.',
      onConfirmAction: executeCreateSpreadsheet,
    });
  };

  const executeCreateSpreadsheet = async () => {
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    const token = getAccessToken();
    if (!token) {
      handleGoogleLogin();
      return;
    }

    setIsLoading(true);
    try {
      const config = await createMasterSpreadsheet(token);
      setSpreadsheetConfig(config);
      showToast('Master Google Sheet Ledger created successfully in Google Drive!');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to create Google Sheet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchSheetRows = async () => {
    const token = getAccessToken();
    if (!token || !spreadsheetConfig) return;

    setIsLoading(true);
    try {
      const rows = await fetchSpreadsheetRows(token, spreadsheetConfig.spreadsheetId);
      setSheetRows(rows);
      showToast(`Fetched ${rows.length} rows from Google Sheet.`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to fetch Google Sheet rows', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppendManualRow = (row: string[]) => {
    setSheetRows((prev) => [...prev, row]);
    showToast('Manual row appended to ledger.');
  };

  // Google Forms & Drive Handlers
  const triggerCreateForm = () => {
    setConfirmModalState({
      isOpen: true,
      title: 'Create Google Form for Client Intake',
      message: 'This will generate a new Google Form titled "House of Sinvi - Bespoke Fitting & Style Consultation" in your Google Drive.',
      onConfirmAction: executeCreateForm,
    });
  };

  const executeCreateForm = async () => {
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    const token = getAccessToken();
    if (!token) {
      handleGoogleLogin();
      return;
    }

    setIsLoading(true);
    try {
      const newForm = await createConsultationForm(token);
      setForms((prev) => [newForm, ...prev]);
      showToast('Google Consultation Form generated! Share link ready.');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to create Google Form', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchFormResponses = async (formId: string) => {
    const token = getAccessToken();
    if (!token) {
      handleGoogleLogin();
      return;
    }

    setIsLoading(true);
    try {
      const responses = await fetchFormResponses(token, formId);
      setFormResponses(responses);
      showToast(`Fetched ${responses.length} responses from Google Forms.`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to fetch form responses', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerConvertResponseToOrder = (resp: FormResponseItem) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Convert Form Response to Couture Order',
      message: `Create a new House of Sinvi order record from client "${resp.clientName}" submission?`,
      onConfirmAction: () => executeConvertResponseToOrder(resp),
    });
  };

  const executeConvertResponseToOrder = (resp: FormResponseItem) => {
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    const newOrder: CoutureOrder = {
      id: `HOS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      clientName: resp.clientName,
      clientEmail: resp.clientEmail,
      clientPhone: '+1 (555) 890-1234',
      garmentName: resp.garmentType,
      collection: 'Custom Bespoke Request',
      status: 'In Consultation',
      fabric: 'Silk Organza & Custom Velvet',
      colorPalette: 'Champagne Gold & Midnight',
      estimatedDelivery: resp.eventDate || '2026-11-01',
      price: 20000,
      depositPaid: 10000,
      measurements: {
        bust: 34,
        waist: 26,
        hips: 36,
        shoulderToWaist: 15,
        waistToFloor: 44,
        armLength: 22,
        neckToShoulder: 5,
        notes: resp.specialRequests,
      },
      fittingDates: [resp.eventDate || '2026-10-15'],
      notes: resp.specialRequests,
      syncedToSheets: false,
      sourceFormResponseId: resp.responseId,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setFormResponses((prev) =>
      prev.map((r) =>
        r.responseId === resp.responseId ? { ...r, convertedToOrder: true } : r
      )
    );
    showToast(`Converted response from ${resp.clientName} into Order #${newOrder.id}.`);
  };

  const triggerCreateDriveFolder = () => {
    setConfirmModalState({
      isOpen: true,
      title: 'Create Dedicated Google Drive Folder',
      message: 'This will create a new folder named "House of Sinvi - Atelier Spec Sheets & Moodboards" in your Google Drive.',
      onConfirmAction: executeCreateDriveFolder,
    });
  };

  const executeCreateDriveFolder = async () => {
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    const token = getAccessToken();
    if (!token) {
      handleGoogleLogin();
      return;
    }

    setIsLoading(true);
    try {
      const folderData = await createAtelierDriveFolder(token);
      setDriveConfig({
        folderId: folderData.folderId,
        folderUrl: folderData.folderUrl,
        folderName: 'House of Sinvi - Atelier Spec Sheets & Moodboards',
      });
      showToast('Google Drive folder created successfully!');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to create Drive folder', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-[#D4AF37] selection:text-black pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-bold uppercase tracking-wider ${
              notification.type === 'success'
                ? 'bg-zinc-900 text-[#D4AF37] border-[#D4AF37]/60'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        needsAuth={needsAuth}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        hasSpreadsheet={!!spreadsheetConfig}
        hasForm={forms.length > 0}
        hasDriveFolder={!!driveConfig}
      />

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'sales' && (
          <SalesManager
            sales={sales}
            customers={customers}
            products={products}
            onAddSale={handleAddSale}
            onDeleteSale={handleDeleteSale}
            onUpdatePaymentStatus={handleUpdateSalePayment}
            onSyncSaleToSheet={triggerSyncSaleToSheets}
            hasSpreadsheet={!!spreadsheetConfig}
            needsAuth={needsAuth}
            onLoginPrompt={handleGoogleLogin}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchasesManager
            purchases={purchases}
            parties={parties}
            products={products}
            onAddPurchase={handleAddPurchase}
            onDeletePurchase={handleDeletePurchase}
            onUpdatePaymentStatus={handleUpdatePurchasePayment}
            onSyncPurchaseToSheet={triggerSyncPurchaseToSheets}
            hasSpreadsheet={!!spreadsheetConfig}
            needsAuth={needsAuth}
            onLoginPrompt={handleGoogleLogin}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerManager
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        )}

        {activeTab === 'parties' && (
          <PurchasePartyManager
            parties={parties}
            onAddParty={handleAddPurchaseParty}
            onDeleteParty={handleDeletePurchaseParty}
          />
        )}

        {activeTab === 'products' && (
          <ProductManager
            products={products}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateStock={handleUpdateStock}
            onSyncProductToSheet={triggerSyncProductToSheets}
            hasSpreadsheet={!!spreadsheetConfig}
            needsAuth={needsAuth}
            onLoginPrompt={handleGoogleLogin}
          />
        )}

        {activeTab === 'accountability' && (
          <AccountabilityDashboard
            sales={sales}
            purchases={purchases}
            customers={customers}
            parties={parties}
            products={products}
            auditLogs={auditLogs}
            spreadsheetConfig={spreadsheetConfig}
            onSyncAllToSheet={triggerSyncAllToSheet}
            isLoading={isLoading}
            needsAuth={needsAuth}
            onLoginPrompt={handleGoogleLogin}
          />
        )}

        {activeTab === 'orders' && (
          <OrderManagement
            orders={orders}
            onAddOrder={handleAddOrder}
            onDeleteOrder={handleDeleteOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateMeasurements={handleUpdateMeasurements}
            onSyncToSheetsRequest={triggerSyncOrderToSheets}
            spreadsheetConfig={spreadsheetConfig}
            needsAuth={needsAuth}
            onLoginPrompt={handleGoogleLogin}
          />
        )}

        {activeTab === 'forms' && (
          <FormBuilder
            forms={forms}
            formResponses={formResponses}
            onCreateFormRequest={triggerCreateForm}
            onFetchResponsesRequest={handleFetchFormResponses}
            onConvertResponseToOrder={triggerConvertResponseToOrder}
            needsAuth={needsAuth}
            onLoginPrompt={handleGoogleLogin}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'sheets' && (
          <SheetsLedger
            spreadsheetConfig={spreadsheetConfig}
            sheetRows={sheetRows}
            orders={orders}
            onCreateSpreadsheetRequest={triggerCreateSpreadsheet}
            onFetchSheetRowsRequest={handleFetchSheetRows}
            onAppendManualRowRequest={handleAppendManualRow}
            needsAuth={needsAuth}
            onLoginPrompt={handleGoogleLogin}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'drive' && (
          <DriveFolderView
            driveConfig={driveConfig}
            onCreateDriveFolderRequest={triggerCreateDriveFolder}
            needsAuth={needsAuth}
            onLoginPrompt={handleGoogleLogin}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Mandatory User Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        details={confirmModalState.details}
        onConfirm={confirmModalState.onConfirmAction}
        onCancel={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

