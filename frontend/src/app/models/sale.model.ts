export interface Sale {
  id: number;
  customerId: number;
  customerName: string;
  saleDate: Date;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus?: string;
  transactionId?: string;
  details: SaleDetail[];
}

export interface SaleDetail {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateSale {
  customerId: number;
  paymentMethod: string;
  transactionId?: string;
  details: CreateSaleDetail[];
}

export interface CreateSaleDetail {
  productId: number;
  quantity: number;
}
