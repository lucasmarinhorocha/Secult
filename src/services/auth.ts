import { LoginRequest, LoginResponse, Usuario } from '../models/types';
import { apiClient } from './api';

class AuthService {
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'auth_user';

  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Tentar primeiro o backend do Docker
      const response = await apiClient.post<{ data: LoginResponse }>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const data = response.data.data;
      localStorage.setItem(this.tokenKey, data.token);
      localStorage.setItem(this.refreshTokenKey, data.refreshToken);
      localStorage.setItem(this.userKey, JSON.stringify(data.usuario));

      return data;
    } catch (error) {
      // Fallback para usuários hardcoded (modo offline/demo)
      const validUsers: Record<string, { password: string; usuario: Usuario }> = {
        'coordenador@test.com': {
          password: 'password123',
          usuario: {
            id: '1',
            email: 'coordenador@test.com',
            nome: 'Coordenador GearOne',
            perfil: 'COORDENADOR',
            ativo: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
          },
        },
        'admin@test.com': {
          password: 'admin123',
          usuario: {
            id: '2',
            email: 'admin@test.com',
            nome: 'Administrador',
            perfil: 'ADMIN',
            ativo: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
          },
        },
        'admin@gearone.com': {
          password: 'admin123',
          usuario: {
            id: '3',
            email: 'admin@gearone.com',
            nome: 'Administrador',
            perfil: 'ADMIN',
            ativo: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
          },
        },
        'coordenador@gearone.com': {
          password: 'coord123',
          usuario: {
            id: '4',
            email: 'coordenador@gearone.com',
            nome: 'Coordenador',
            perfil: 'COORDENADOR',
            ativo: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
          },
        },
      };

      const stored = localStorage.getItem('demo_users');
      const demoUsers: Record<string, { password: string; usuario: Usuario }> = stored ? JSON.parse(stored) : {};

      const users = { ...validUsers, ...demoUsers };

      const user = users[credentials.email.toLowerCase()];
      if (!user || user.password !== credentials.password) {
        throw new Error('E-mail ou senha inválidos.');
      }

      const response: LoginResponse = {
        token: 'demo-token',
        refreshToken: 'demo-refresh-token',
        usuario: user.usuario,
      };

      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem(this.refreshTokenKey, response.refreshToken);
      localStorage.setItem(this.userKey, JSON.stringify(response.usuario));

      return response;
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Obter token atual
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Obter refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Obter usuário armazenado
  getCurrentUser(): Usuario | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Verificar se usuário tem permissão
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Isso seria verificado com a API em produção
    // Por enquanto, usar role como validação simples
    const permissions: Record<string, string[]> = {
      COORDENADOR: ['ler', 'criar', 'atualizar', 'deletar', 'exportar'],
      RECEPCAO: ['ler', 'criar', 'atualizar'],
      PRODUCAO: ['ler', 'criar', 'atualizar'],
      LIMPEZA: ['ler', 'criar'],
      ADMIN: ['ler', 'criar', 'atualizar', 'deletar', 'exportar'],
    };

    return (permissions[user.perfil] || []).includes(permission);
  }

  // Verificar se tem role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.perfil === role;
  }

  // Renovar token
  async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await apiClient.post<{ token: string }>('/auth/refresh', {
        refreshToken,
      });

      localStorage.setItem(this.tokenKey, response.token);
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  // Registrar novo usuário (se disponível)
  async register(userData: any): Promise<LoginResponse> {
    try {
      const email: string = (userData.email || '').toLowerCase();
      const password: string = userData.password;
      const nome: string = userData.nome || email.split('@')[0];
      const perfil: any = userData.perfil || 'RECEPCAO';

      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios para registro.');
      }

      const response = await apiClient.post<{ data: LoginResponse }>('/auth/register', {
        nome,
        email,
        password,
        perfil,
      });

      const data = response.data;
      localStorage.setItem(this.tokenKey, data.token);
      localStorage.setItem(this.refreshTokenKey, data.refreshToken);
      localStorage.setItem(this.userKey, JSON.stringify(data.usuario));

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Falha ao registrar usuário.');
    }
  }

  // Solicitar reset de senha
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/password-reset-request', { email });
    } catch (error) {
      throw new Error('Falha ao solicitar reset de senha.');
    }
  }

  // Confirmar reset de senha
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/password-reset-confirm', { token, newPassword });
    } catch (error) {
      throw new Error('Falha ao confirmar reset de senha.');
    }
  }
}

export const authService = new AuthService();
