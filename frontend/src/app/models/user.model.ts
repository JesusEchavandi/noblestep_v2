export interface Usuario {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  correo: string;
  rol: string;
  activo: boolean;
}

export interface SolicitudInicioSesion {
  nombreUsuario: string;
  contrasena: string;
}

export interface RespuestaInicioSesion {
  token: string;
  nombreUsuario: string;
  nombreCompleto: string;
  rol: string;
  expiraEn: Date;
}
