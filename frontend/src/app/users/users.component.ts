import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, Usuario, CrearUsuario, ActualizarUsuario } from '../services/user.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuariosPaginados: Usuario[] = [];
  cargando = true;
  guardando = false;
  mostrarModal = false;
  modoEdicion = false;
  textoBusqueda = '';
  filtroRol = '';
  filtroEstado = '';

  // Paginación
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 1;
  paginas: number[] = [];

  usuario: any = {
    nombreUsuario: '',
    nombreCompleto: '',
    correo: '',
    contrasena: '',
    rol: 'Vendedor',
    activo: true
  };

  idEdicion = 0;
  roles = ['Administrador', 'Vendedor'];

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.userService.obtenerUsuarios().subscribe({
      next: (datos) => {
        this.usuarios = datos;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error cargando usuarios:', error);
        this.notificationService.notifyError('Error al cargar usuarios');
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.usuariosFiltrados = this.usuarios.filter(u => {
      const coincideBusqueda = !this.textoBusqueda ||
        u.nombreUsuario.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        u.nombreCompleto.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        u.correo.toLowerCase().includes(this.textoBusqueda.toLowerCase());

      const coincideRol = !this.filtroRol || u.rol === this.filtroRol;

      const coincideEstado = !this.filtroEstado ||
        (this.filtroEstado === 'active' && u.activo) ||
        (this.filtroEstado === 'inactive' && !u.activo);

      return coincideBusqueda && coincideRol && coincideEstado;
    });
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.filtroRol = '';
    this.filtroEstado = '';
    this.usuariosFiltrados = this.usuarios;
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.usuariosFiltrados.length / this.tamanoPagina));
    if (this.paginaActual > this.totalPaginas) this.paginaActual = this.totalPaginas;
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    this.usuariosPaginados = this.usuariosFiltrados.slice(inicio, inicio + this.tamanoPagina);
    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.usuario = {
      nombreUsuario: '',
      nombreCompleto: '',
      correo: '',
      contrasena: '',
      rol: 'Vendedor',
      activo: true
    };
    this.mostrarModal = true;
  }

  abrirModalEditar(u: Usuario): void {
    this.modoEdicion = true;
    this.idEdicion = u.id;
    this.usuario = {
      nombreUsuario: u.nombreUsuario,
      nombreCompleto: u.nombreCompleto,
      correo: u.correo,
      contrasena: '',
      rol: u.rol,
      activo: u.activo
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.usuario = {
      nombreUsuario: '',
      nombreCompleto: '',
      correo: '',
      contrasena: '',
      rol: 'Vendedor',
      activo: true
    };
  }

  guardarUsuario(): void {
    if (this.modoEdicion) {
      this.actualizarUsuario();
    } else {
      this.crearUsuario();
    }
  }

  crearUsuario(): void {
    this.guardando = true;
    const nuevo: CrearUsuario = {
      nombreUsuario: this.usuario.nombreUsuario,
      nombreCompleto: this.usuario.nombreCompleto,
      correo: this.usuario.correo,
      contrasena: this.usuario.contrasena,
      rol: this.usuario.rol
    };

    this.userService.crearUsuario(nuevo).subscribe({
      next: () => {
        this.notificationService.notifySuccess('Usuario creado exitosamente');
        this.cargarUsuarios();
        this.cerrarModal();
        this.guardando = false;
      },
      error: (error: any) => {
        console.error('Error creando usuario:', error);
        this.notificationService.notifyError(error.error?.message || 'Error al crear usuario');
        this.guardando = false;
      }
    });
  }

  actualizarUsuario(): void {
    this.guardando = true;
    const actualizado: ActualizarUsuario = {
      nombreUsuario: this.usuario.nombreUsuario,
      nombreCompleto: this.usuario.nombreCompleto,
      correo: this.usuario.correo,
      contrasena: this.usuario.contrasena || undefined,
      rol: this.usuario.rol,
      activo: this.usuario.activo
    };

    this.userService.actualizarUsuario(this.idEdicion, actualizado).subscribe({
      next: () => {
        this.notificationService.notifySuccess('Usuario actualizado exitosamente');
        this.cargarUsuarios();
        this.cerrarModal();
        this.guardando = false;
      },
      error: (error: any) => {
        console.error('Error actualizando usuario:', error);
        this.notificationService.notifyError(error.error?.message || 'Error al actualizar usuario');
        this.guardando = false;
      }
    });
  }

  alternarEstadoUsuario(u: Usuario): void {
    const accion = u.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Está seguro que desea ${accion} a ${u.nombreCompleto}?`)) {
      return;
    }

    const operacion = u.activo
      ? this.userService.desactivarUsuario(u.id)
      : this.userService.activarUsuario(u.id);

    operacion.subscribe({
      next: () => {
        this.notificationService.notifySuccess(`Usuario ${accion}do exitosamente`);
        this.cargarUsuarios();
      },
      error: (error: any) => {
        console.error('Error cambiando estado de usuario:', error);
        this.notificationService.notifyError(error.error?.message || `Error al ${accion} usuario`);
      }
    });
  }

  eliminarUsuario(u: Usuario): void {
    if (!confirm(`¿Está seguro que desea eliminar a ${u.nombreCompleto}?`)) {
      return;
    }

    this.userService.eliminarUsuario(u.id).subscribe({
      next: (response: any) => {
        if (response?.message) {
          this.notificationService.notifySuccess(response.message);
        } else {
          this.notificationService.notifySuccess('Usuario eliminado exitosamente');
        }
        this.cargarUsuarios();
      },
      error: (error: any) => {
        console.error('Error eliminando usuario:', error);
        this.notificationService.notifyError(error.error?.message || 'Error al eliminar usuario');
      }
    });
  }

  obtenerClaseBadgeRol(rol: string): string {
    switch (rol) {
      case 'Administrador': return 'bg-danger';
      case 'Vendedor': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  obtenerIconoRol(rol: string): string {
    switch (rol) {
      case 'Administrador': return 'bi-shield-fill-check';
      case 'Vendedor': return 'bi-person';
      default: return 'bi-person';
    }
  }
}
