// API Service for Frontend
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle token expiration
      if (response.status === 401) {
        this.setToken(null);
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials) {
    const data = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async register(userData) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.setToken(null);
    }
  }

  async refreshToken() {
    const data = await this.makeRequest('/auth/refresh', {
      method: 'POST',
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  // User management
  async getCurrentUser() {
    return this.makeRequest('/users/me');
  }

  async updateProfile(userData) {
    return this.makeRequest('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Products
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id) {
    return this.makeRequest(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.makeRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.makeRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Transactions
  async getTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async getTransaction(id) {
    return this.makeRequest(`/transactions/${id}`);
  }

  async createTransaction(transactionData) {
    return this.makeRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransaction(id, transactionData) {
    return this.makeRequest(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  }

  // Analytics
  async getAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/analytics${queryString ? `?${queryString}` : ''}`);
  }

  async getDashboardStats() {
    return this.makeRequest('/analytics/dashboard');
  }

  async getChartData(type, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/analytics/charts/${type}${queryString ? `?${queryString}` : ''}`);
  }

  // File upload
  async uploadFile(file, type = 'image') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.makeRequest('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        // Don't set Content-Type for FormData, let browser set it
      },
    });
  }

  // Blockchain integration
  async verifyProduct(productId, blockchainData) {
    return this.makeRequest(`/products/${productId}/verify`, {
      method: 'POST',
      body: JSON.stringify(blockchainData),
    });
  }

  async getBlockchainTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/blockchain/transactions${queryString ? `?${queryString}` : ''}`);
  }

  // WebSocket connection for real-time updates
  connectWebSocket() {
    const wsUrl = this.baseURL.replace(/^http/, 'ws').replace('/api', '');
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected');
      // Send authentication token
      if (this.token) {
        socket.send(JSON.stringify({
          type: 'authenticate',
          token: this.token
        }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(), 5000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return socket;
  }

  handleWebSocketMessage(message) {
    // Dispatch custom events for different message types
    const event = new CustomEvent('websocket-message', {
      detail: message
    });
    window.dispatchEvent(event);

    // Handle specific message types
    switch (message.type) {
      case 'transaction-update':
        window.dispatchEvent(new CustomEvent('transaction-updated', {
          detail: message.data
        }));
        break;
      case 'product-update':
        window.dispatchEvent(new CustomEvent('product-updated', {
          detail: message.data
        }));
        break;
      case 'notification':
        window.dispatchEvent(new CustomEvent('notification', {
          detail: message.data
        }));
        break;
    }
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health');
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
