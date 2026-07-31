import { CoutureOrder, FormResponseItem, ProductDetail, PurchaseEntry, SaleEntry, SpreadsheetConfig, WorkspaceForm } from '../types';

/**
 * GOOGLE SHEETS API
 */

export async function createMasterSpreadsheet(accessToken: string): Promise<SpreadsheetConfig> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'House of Sinvi - Master Atelier Ledger',
      },
      sheets: [
        { properties: { title: 'Sales Ledger' } },
        { properties: { title: 'Purchases Ledger' } },
        { properties: { title: 'Couture Orders' } },
        { properties: { title: 'Products Catalog' } },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Google Sheet: ${errorText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Initialize Header Rows for sheets
  const headers = [
    {
      range: 'Sales Ledger!A1:J1',
      values: [['Timestamp', 'PartyID', 'Sale ID', 'Customer Name', 'QTY', 'Amount', 'GST %', 'Paid Amount', 'Balance Due', 'Status']],
    },
    {
      range: 'Purchases Ledger!A1:J1',
      values: [['Timestamp', 'PartyID', 'Purchase ID', 'Party Name', 'QTY', 'Amount', 'GST %', 'Paid Amount', 'Balance Due', 'Status']],
    },
    {
      range: 'Couture Orders!A1:L1',
      values: [['Timestamp', 'PartyID', 'Order ID', 'Client Name', 'Client Email', 'Phone', 'Garment Name', 'Status', 'Fabric', 'Amount', 'Deposit', 'Delivery Date']],
    },
    {
      range: 'Products Catalog!A1:H1',
      values: [['Timestamp', 'Product ID', 'SKU', 'Name', 'Category', 'Stock QTY', 'Purchase Cost', 'Selling Price']],
    },
  ];

  for (const h of headers) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(h.range)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: h.values }),
      }
    );
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    sheetTitle: 'House of Sinvi Master Ledger',
    lastSyncedAt: new Date().toISOString(),
  };
}

export async function syncOrderToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  order: CoutureOrder
): Promise<boolean> {
  const rowValues = [
    order.createdAt || new Date().toISOString(),
    order.clientEmail || order.clientName,
    order.id,
    order.clientName,
    order.clientEmail,
    order.clientPhone,
    order.garmentName,
    order.status,
    order.fabric,
    order.price,
    order.depositPaid,
    order.estimatedDelivery,
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('Couture Orders')}!A1:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to append row to Google Sheet: ${errText}`);
  }

  return true;
}

export async function syncSaleToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  sale: SaleEntry
): Promise<boolean> {
  const totalQty = sale.items?.reduce((acc, item) => acc + item.quantity, 0) || 1;
  const rowValues = [
    sale.createdAt || sale.date || new Date().toISOString(),
    sale.customerId || 'CUST-000',
    sale.id,
    sale.customerName,
    totalQty,
    sale.totalAmount,
    sale.gstPercentage ?? 18,
    sale.paidAmount,
    sale.balanceDue,
    sale.paymentStatus,
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('Sales Ledger')}!A1:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to append Sale row to Google Sheet: ${errText}`);
  }

  return true;
}

export async function syncPurchaseToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  purchase: PurchaseEntry
): Promise<boolean> {
  const totalQty = purchase.items?.reduce((acc, item) => acc + item.quantity, 0) || 1;
  const rowValues = [
    purchase.createdAt || purchase.date || new Date().toISOString(),
    purchase.partyId || 'PARTY-000',
    purchase.id,
    purchase.partyName,
    totalQty,
    purchase.totalCost,
    purchase.gstPercentage ?? 18,
    purchase.paidAmount,
    purchase.balanceDue,
    purchase.paymentStatus,
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('Purchases Ledger')}!A1:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to append Purchase row to Google Sheet: ${errText}`);
  }

  return true;
}

export async function syncProductToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  product: ProductDetail
): Promise<boolean> {
  const rowValues = [
    product.createdAt || new Date().toISOString(),
    product.id,
    product.sku,
    product.name,
    product.category,
    product.stockInHand,
    product.purchaseCost,
    product.sellingPrice,
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('Products Catalog')}!A1:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to append Product row to Google Sheet: ${errText}`);
  }

  return true;
}

export async function fetchSpreadsheetRows(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string = 'Sales Ledger'
): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:Z200`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    // Fallback to first sheet or Couture Orders
    const fallbackUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:Z200`;
    const fbRes = await fetch(fallbackUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!fbRes.ok) {
      throw new Error(`Failed to read Google Sheet values: ${response.statusText}`);
    }
    const fbData = await fbRes.json();
    return fbData.values || [];
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * GOOGLE FORMS API
 */

export async function createConsultationForm(accessToken: string): Promise<WorkspaceForm> {
  // Step 1: Create empty form
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: 'House of Sinvi - Bespoke Fitting & Style Consultation',
        documentTitle: 'House of Sinvi Client Consultation Form',
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create Google Form: ${err}`);
  }

  const formData = await createRes.json();
  const formId = formData.formId;

  // Step 2: Batch update to add questions
  const batchUrl = `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`;
  const updateRes = await fetch(batchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          createItem: {
            item: {
              title: 'Full Name',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {},
                },
              },
            },
            location: { index: 0 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Email Address',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {},
                },
              },
            },
            location: { index: 1 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Envisioned Garment & Occasion',
              description: 'e.g., Red Carpet Evening Gown, Bridal Couture, Silk Velvet Tuxedo',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {},
                },
              },
            },
            location: { index: 2 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Target Event / Fitting Date',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {},
                },
              },
            },
            location: { index: 3 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Estimated Couture Budget Range',
              questionItem: {
                question: {
                  required: false,
                  choiceQuestion: {
                    type: 'RADIO',
                    options: [
                      { value: '$5,000 - $10,000' },
                      { value: '$10,000 - $25,000' },
                      { value: '$25,000 - $50,000+' },
                    ],
                  },
                },
              },
            },
            location: { index: 4 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Special Fabric, Silhouette, or Body Measurement Notes',
              questionItem: {
                question: {
                  required: false,
                  textQuestion: { paragraph: true },
                },
              },
            },
            location: { index: 5 },
          },
        },
      ],
    }),
  });

  if (!updateRes.ok) {
    console.warn('Form created but questions failed to populate:', await updateRes.text());
  }

  return {
    formId,
    title: 'House of Sinvi - Bespoke Fitting & Style Consultation',
    description: 'Bespoke couture appointment questionnaire & fabric design intake.',
    responderUri: formData.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`,
    editUri: `https://docs.google.com/forms/d/${formId}/edit`,
    createdAt: new Date().toISOString(),
    responseCount: 0,
  };
}

export async function fetchFormResponses(
  accessToken: string,
  formId: string
): Promise<FormResponseItem[]> {
  const url = `https://forms.googleapis.com/v1/forms/${formId}/responses`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch form responses: ${response.statusText}`);
  }

  const data = await response.json();
  const responses = data.responses || [];

  return responses.map((r: any) => {
    const answers = r.answers || {};
    let clientName = 'Anonymous Client';
    let clientEmail = '';
    let garmentType = 'Bespoke Couture';
    let budgetRange = '$10,000+';
    let eventDate = 'TBD';
    let specialRequests = '';
    const rawAnswers: Record<string, string> = {};

    Object.keys(answers).forEach((qId) => {
      const textVal = answers[qId]?.textAnswers?.answers?.[0]?.value || '';
      rawAnswers[qId] = textVal;
      if (textVal.includes('@')) clientEmail = textVal;
      else if (!clientName || clientName === 'Anonymous Client') clientName = textVal;
      else if (!garmentType || garmentType === 'Bespoke Couture') garmentType = textVal;
      else specialRequests += ' ' + textVal;
    });

    return {
      responseId: r.responseId,
      createTime: r.createTime || new Date().toISOString(),
      clientName: clientName || 'Couture Client',
      clientEmail: clientEmail || 'client@houseofsinvi.com',
      garmentType: garmentType || 'Evening Couture Gown',
      budgetRange: budgetRange,
      eventDate: eventDate,
      specialRequests: specialRequests.trim() || 'Custom embroidery & silk lining.',
      rawAnswers,
    };
  });
}

/**
 * GOOGLE DRIVE API
 */

export async function createAtelierDriveFolder(accessToken: string): Promise<{ folderId: string; folderUrl: string }> {
  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'House of Sinvi - Atelier Spec Sheets & Moodboards',
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to create Drive folder: ${err}`);
  }

  const data = await response.json();
  return {
    folderId: data.id,
    folderUrl: `https://drive.google.com/drive/folders/${data.id}`,
  };
}
