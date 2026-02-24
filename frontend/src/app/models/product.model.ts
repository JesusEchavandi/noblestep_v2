export interface ProductVariant {
  id: number;
  productId: number;
  productName: string;
  brand: string;
  size: string;
  stock: number;
  isActive: boolean;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  categoryId: number;
  categoryName: string;
  size: string;
  price: number;
  salePrice: number;
  stock: number;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  variants?: ProductVariant[];
}

export interface CreateProduct {
  name: string;
  brand: string;
  categoryId: number;
  size: string;
  price: number;
  salePrice: number;
  stock: number;
  imageUrl?: string;
  description?: string;
}

export interface UpdateProduct extends CreateProduct {
  isActive: boolean;
}

export interface CreateVariant {
  size: string;
  stock: number;
}

export interface UpdateVariantStock {
  stock: number;
}
