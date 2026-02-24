export interface Category {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface CreateCategory {
  name: string;
  description: string;
}
