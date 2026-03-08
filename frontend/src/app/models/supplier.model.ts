export interface Proveedor {
  id: number;
  nombreEmpresa: string;
  nombreContacto: string;
  numeroDocumento: string;
  telefono: string;
  correo: string;
  direccion: string;
  ciudad: string;
  pais: string;
  activo: boolean;
}

export interface CrearProveedor {
  nombreEmpresa: string;
  nombreContacto: string;
  numeroDocumento: string;
  telefono: string;
  correo: string;
  direccion: string;
  ciudad: string;
  pais: string;
}

export interface ActualizarProveedor {
  nombreEmpresa: string;
  nombreContacto: string;
  numeroDocumento: string;
  telefono: string;
  correo: string;
  direccion: string;
  ciudad: string;
  pais: string;
  activo: boolean;
}
