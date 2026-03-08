export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface CrearCategoria {
  nombre: string;
  descripcion: string;
}
