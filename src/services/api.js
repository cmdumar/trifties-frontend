import axios from 'axios';

// Create axios instance with base configuration
// Note: Rails server should run on port 3000 (or update this URL)
// You can run Rails on a different port with: PORT=3001 rails server
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token extraction
api.interceptors.response.use(
  (response) => {
    // Ensure we can access Authorization header
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Books API
export const booksAPI = {
  // Get all books
  getAll: () => api.get('/books'),
  
  // Get a single book
  getById: (id) => api.get(`/books/${id}`),
  
  // Search books
  search: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/books/search?${queryString}`);
  },
  
  // Create a book (requires authentication)
  create: (bookData, coverImage) => {
    const formData = new FormData();
    
    // Append all book fields
    Object.keys(bookData).forEach(key => {
      if (bookData[key] !== null && bookData[key] !== '') {
        formData.append(`book[${key}]`, bookData[key]);
      }
    });
    
    // Append cover image if provided
    if (coverImage) {
      formData.append('book[cover_image]', coverImage);
    }
    
    return api.post('/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update a book (requires authentication)
  update: (id, bookData, coverImage) => {
    const formData = new FormData();
    
    // Append all book fields
    Object.keys(bookData).forEach(key => {
      if (bookData[key] !== null && bookData[key] !== '') {
        formData.append(`book[${key}]`, bookData[key]);
      }
    });
    
    // Append cover image if provided
    if (coverImage) {
      formData.append('book[cover_image]', coverImage);
    }
    
    return api.patch(`/books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Delete a book (requires authentication)
  delete: (id) => api.delete(`/books/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
};

// Auth API
export const authAPI = {
  signIn: (email, password) => 
    api.post('/users/sign_in', { user: { email, password } }),
  
  signUp: (email, password, passwordConfirmation) =>
    api.post('/users/sign_up', {
      user: { email, password, password_confirmation: passwordConfirmation },
    }),
  
  signOut: () => api.delete('/users/sign_out'),
};

// Reservations API
export const reservationsAPI = {
  // Get all user's reservations
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/reservations${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get a single reservation
  getById: (id) => api.get(`/reservations/${id}`),
  
  // Create a reservation
  create: (bookId, note = '') => 
    api.post('/reservations', { book_id: bookId, note }),
  
  // Update a reservation
  update: (id, data) => 
    api.patch(`/reservations/${id}`, { reservation: data }),
  
  // Cancel a reservation
  cancel: (id) => api.delete(`/reservations/${id}`),
};

// User Profile API
export const profileAPI = {
  getProfile: () => api.get('/users/profile'),
};

export default api;

