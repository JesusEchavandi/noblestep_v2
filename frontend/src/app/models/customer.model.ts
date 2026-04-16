export interface Cliente {
  id: number;
  nombreCompleto: string;
  numeroDocumento: string;
  telefono: string;
  correo?: string | null;
  activo: boolean;
}

export interface CrearCliente {
  nombreCompleto: string;
  numeroDocumento: string;
  telefono: string;
  correo?: string | null;
}
