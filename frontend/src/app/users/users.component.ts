import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User, CreateUser, UpdateUser } from '../services/user.service';
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

  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  saving = false;
  showModal = false;
  isEditMode = false;
  searchText = '';
  filterRole = '';
  filterStatus = '';

  user: any = {
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'Employee',
    isActive: true
  };

  editingId = 0;
  roles = ['Administrator', 'Manager', 'Employee'];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.notificationService.notifyError('Error al cargar usuarios');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const searchMatch = !this.searchText ||
        user.username.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.fullName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchText.toLowerCase());

      const roleMatch = !this.filterRole || user.role === this.filterRole;

      const statusMatch = !this.filterStatus ||
        (this.filterStatus === 'active' && user.isActive) ||
        (this.filterStatus === 'inactive' && !user.isActive);

      return searchMatch && roleMatch && statusMatch;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterRole = '';
    this.filterStatus = '';
    this.filteredUsers = this.users;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.user = {
      username: '',
      fullName: '',
      email: '',
      password: '',
      role: 'Employee',
      isActive: true
    };
    this.showModal = true;
  }

  openEditModal(user: User): void {
    this.isEditMode = true;
    this.editingId = user.id;
    this.user = {
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.user = {
      username: '',
      fullName: '',
      email: '',
      password: '',
      role: 'Employee',
      isActive: true
    };
  }

  saveUser(): void {
    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    this.saving = true;
    const newUser: CreateUser = {
      username: this.user.username,
      fullName: this.user.fullName,
      email: this.user.email,
      password: this.user.password,
      role: this.user.role
    };

    this.userService.createUser(newUser).subscribe({
      next: () => {
        this.notificationService.notifySuccess('Usuario creado exitosamente');
        this.loadUsers();
        this.closeModal();
        this.saving = false;
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.notificationService.notifyError(error.error?.message || 'Error al crear usuario');
        this.saving = false;
      }
    });
  }

  updateUser(): void {
    this.saving = true;
    const updatedUser: UpdateUser = {
      username: this.user.username,
      fullName: this.user.fullName,
      email: this.user.email,
      password: this.user.password || undefined,
      role: this.user.role,
      isActive: this.user.isActive
    };

    this.userService.updateUser(this.editingId, updatedUser).subscribe({
      next: () => {
        this.notificationService.notifySuccess('Usuario actualizado exitosamente');
        this.loadUsers();
        this.closeModal();
        this.saving = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.notificationService.notifyError(error.error?.message || 'Error al actualizar usuario');
        this.saving = false;
      }
    });
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'desactivar' : 'activar';
    if (!confirm(`¿Está seguro que desea ${action} a ${user.fullName}?`)) {
      return;
    }

    const operation = user.isActive
      ? this.userService.deactivateUser(user.id)
      : this.userService.activateUser(user.id);

    operation.subscribe({
      next: () => {
        this.notificationService.notifySuccess(`Usuario ${action}do exitosamente`);
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        this.notificationService.notifyError(error.error?.message || `Error al ${action} usuario`);
      }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`¿Está seguro que desea eliminar a ${user.fullName}?`)) {
      return;
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.notificationService.notifySuccess('Usuario eliminado exitosamente');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.notificationService.notifyError(error.error?.message || 'Error al eliminar usuario');
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'Administrator': return 'bg-danger';
      case 'Manager': return 'bg-warning';
      case 'Employee': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'Administrator': return 'bi-shield-fill-check';
      case 'Manager': return 'bi-person-badge';
      case 'Employee': return 'bi-person';
      default: return 'bi-person';
    }
  }
}
