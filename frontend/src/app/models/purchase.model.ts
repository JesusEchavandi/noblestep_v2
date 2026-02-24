export interface Purchase {
  id: number;
  supplierId: number;
  supplierName: string;
  purchaseDate: Date;
  invoiceNumber: string;
  total: number;
  status: string;
  notes: string;
  details: PurchaseDetail[];
}

export interface PurchaseDetail {
  id: number;
  productId: number;
  productName: string;
  variantId?: number;
  size?: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface CreatePurchase {
  supplierId: number;
  purchaseDate: Date;
  invoiceNumber: string;
  notes: string;
  details: CreatePurchaseDetail[];
}

export interface CreatePurchaseDetail {
  productId: number;
  variantId?: number;
  quantity: number;
  unitCost: number;
}
