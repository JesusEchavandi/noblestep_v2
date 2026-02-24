export interface Customer {
  id: number;
  fullName: string;
  documentNumber: string;
  phone: string;
  email: string;
  isActive: boolean;
}

export interface CreateCustomer {
  fullName: string;
  documentNumber: string;
  phone: string;
  email: string;
}
