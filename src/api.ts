// src/api.ts
import { Quote, User } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  // Quotes endpoints
  async getQuotes(params: {
    search?: string;
    tags?: string[];
    collections?: string[];
    page?: number;
    limit?: number;
  }): Promise<{ quotes: Quote[]; totalPages: number; currentPage: number }> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.set('search', params.search);
    if (params.tags?.length) queryParams.set('tags', params.tags.join(','));
    if (params.collections?.length) queryParams.set('collections', params.collections.join(','));
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());

    return this.request(`/quotes?${queryParams.toString()}`);
  }

  async createQuote(quote: Omit<Quote, '_id' | 'userId' | 'createdAt'>): Promise<Quote> {
    return this.request('/quotes', {
      method: 'POST',
      body: JSON.stringify(quote),
    });
  }

  async updateQuote(id: string, quote: Partial<Quote>): Promise<Quote> {
    return this.request(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quote),
    });
  }

  async deleteQuote(id: string): Promise<void> {
    return this.request(`/quotes/${id}`, {
      method: 'DELETE',
    });
  }

  // Tags endpoints
  async getTags(): Promise<string[]> {
    return this.request('/tags');
  }
}

export const api = new ApiClient();
