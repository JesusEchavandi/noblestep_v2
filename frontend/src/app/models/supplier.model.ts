export interface Supplier {
  id: number;
  companyName: string;
  contactName: string;
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  isActive: boolean;
}

export interface CreateSupplier {
  companyName: string;
  contactName: string;
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
}

export interface UpdateSupplier {
  companyName: string;
  contactName: string;
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  isActive: boolean;
}
