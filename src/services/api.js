const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sellnext.onrender.com/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  // Set auth token
  setAuthToken(token, remember = false) {
    if (remember) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }
  }

  // Remove auth token
  removeAuthToken() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Product endpoints
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserProducts(userId) {
    return this.request(`/products/user/${userId}`);
  }

  async getUserProfile(userId) {
    return this.request(`/auth/user/${userId}`);
  }

  // Favorites endpoints
  async addToFavorites(productId) {
    return this.request(`/products/${productId}/favorite`, {
      method: 'POST',
    });
  }

  async removeFromFavorites(productId) {
    return this.request(`/products/${productId}/favorite`, {
      method: 'DELETE',
    });
  }

  async getUserFavorites() {
    return this.request('/products/favorites/user');
  }

  // Messaging endpoints
  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getConversationMessages(conversationId, page = 1, limit = 50) {
    return this.request(`/messages/conversations/${conversationId}?page=${page}&limit=${limit}`);
  }

  async createConversation(data) {
    return this.request('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendMessage(messageData) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageAsRead(messageId) {
    return this.request(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  async getUnreadCount() {
    return this.request('/messages/unread-count');
  }
}

export default new ApiService();