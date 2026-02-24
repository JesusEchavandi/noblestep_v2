export interface ProductSize {
  variantId: number;
  size: string;
  stock: number;
  available: boolean;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  size?: string;       // legacy — talla única si no hay variantes
  price: number;
  salePrice: number;
  stock: number;       // stock total sumado de variantes activas
  brand?: string;
  categoryId: number;
  categoryName: string;
  imageUrl?: string;
  createdAt?: string | Date;
  sizes: ProductSize[]; // variantes de talla con stock individual
}

export interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variantId?: number;  // ID de la variante (talla) seleccionada
  selectedSize?: string; // talla legible para mostrar en UI
}
