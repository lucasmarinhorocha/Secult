import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse } from '../models/types';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token JWT
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para tratar respostas e erros
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Se receber 401, tentar renovar token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            const response = await axios.post(`${this.baseURL}/auth/refresh`, {
              refreshToken,
            });

            const { token } = response.data;
            localStorage.setItem('auth_token', token);

            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // GET
  async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<T>>(url, { params });
      return response.data.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST
  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(url, data);
      return response.data.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT
  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<T>>(url, data);
      return response.data.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE
  async delete<T>(url: string): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(url);
      return response.data.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload de arquivo
  async uploadFile<T>(url: string, file: File, additionalData?: any): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value as any);
        });
      }

      const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Resposta do servidor com status fora do intervalo 2xx
      const message =
        error.response.data?.error || error.response.data?.message || 'Erro na requisição';
      return new Error(message);
    } else if (error.request) {
      // Requisição feita mas sem resposta
      return new Error('Sem conexão com o servidor. Verifique sua conexão de internet.');
    } else {
      // Erro ao configurar a requisição
      return new Error(error.message);
    }
  }
}

export const apiClient = new ApiClient();
