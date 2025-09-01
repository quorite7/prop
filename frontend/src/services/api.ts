import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { authService } from './authService';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    // Use the base URL directly for AWS Lambda
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const apiBaseUrl = baseUrl;
    
    this.api = axios.create({
      baseURL: apiBaseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add Cognito auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await authService.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Failed to get access token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            // Try to logout user on auth error
            await authService.logout();
          } catch (logoutError) {
            console.error('Logout failed:', logoutError);
          }
          // Redirect to login page
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get(url, config);
    // Handle both local server format (response.data.data) and AWS Lambda format (response.data)
    return response.data.data || response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post(url, data, config);
    // Handle both local server format (response.data.data) and AWS Lambda format (response.data)
    return response.data.data || response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put(url, data, config);
    return response.data.data || response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete(url, config);
    return response.data.data || response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch(url, data, config);
    return response.data.data || response.data;
  }

  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await this.api.post(url, formData, config);
    return response.data.data || response.data;
  }
}

export const apiService = new ApiService();
