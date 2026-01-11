/// <reference types="vite/client" />
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, Product, Transaction, UserRole } from './types';
import { toast } from 'sonner';

// --- Auth Context ---
interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: User, pass: string) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  resetPassword: (email: string, newPass: string) => void;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Inventory Context ---
interface InventoryContextType {
  products: Product[];
  transactions: Transaction[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, type: 'IN' | 'OUT', quantity: number, userName: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("useInventory must be used within InventoryProvider");
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// --- Providers ---
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false, isLoading: true });
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper for authenticated requests
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('inventory_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && token !== 'undefined' && token !== 'null' ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const url = `${API_URL}${endpoint}`;
    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          const text = await response.text();
          console.error(`API Error (Non-JSON) at ${endpoint}:`, text);
          throw new Error(`Server Error: ${response.status} ${response.statusText}`);
        }

        console.error(`API Error at ${endpoint}:`, errorData);

        const errorMsg = typeof errorData.detail === 'string'
          ? errorData.detail
          : (errorData.detail?.[0]?.msg || errorData.message || errorData.error || `Error ${response.status}: API Request Failed`);

        throw new Error(errorMsg);
      }

      return response.json();
    } catch (error: any) {
      console.error(`Fetch Failure at ${endpoint}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('inventory_user');
      const token = localStorage.getItem('inventory_token');

      if (savedUser && token) {
        setAuth({ user: JSON.parse(savedUser), isAuthenticated: true, isLoading: false });
        loadData();
      } else {
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    };
    initAuth();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, transactionsData] = await Promise.all([
        apiCall('/inventory/'),
        apiCall('/transactions/')
      ]);
      setProducts(productsData);
      setTransactions(transactionsData);

      const savedUser = JSON.parse(localStorage.getItem('inventory_user') || '{}');
      if (savedUser.role === 'SUPER_ADMIN') {
        try {
          const usersData = await apiCall('/auth/users/');
          setUsers(usersData);
        } catch (e) { console.error('Users load failed', e); }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const login = async (identifier: string, pass: string) => {
    try {
      const data = await apiCall('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username: identifier, password: pass })
      });

      const { user, accessToken, tokenType } = data;
      setAuth({ user, isAuthenticated: true, isLoading: false });
      localStorage.setItem('inventory_user', JSON.stringify(user));
      localStorage.setItem('inventory_token', accessToken);

      loadData();
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  };

  const logout = () => {
    setAuth({ user: null, isAuthenticated: false, isLoading: false });
    localStorage.removeItem('inventory_user');
    localStorage.removeItem('inventory_token');
    setProducts([]);
    setTransactions([]);
  };

  const addUser = async (user: User, pass: string) => {
    try {
      const { id, ...userData } = user;
      await apiCall('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({ ...userData, password: pass })
      });
      toast.success('User added');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateUser = async (updated: User) => {
    try {
      const { id, ...profileData } = updated;
      await apiCall(`/auth/profile/`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      toast.success('Profile updated');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await apiCall(`/auth/users/${id}/`, { method: 'DELETE' });
      toast.success('User deleted');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const resetPassword = async (email: string, newPass: string) => {
    try {
      await apiCall(`/auth/reset-password/`, {
        method: 'POST',
        body: JSON.stringify({ email, newPass })
      });
      toast.success('Password reset successfully');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addProduct = async (p: Product) => {
    try {
      await apiCall('/inventory/', {
        method: 'POST',
        body: JSON.stringify(p)
      });
      toast.success('Product added');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateProduct = async (p: Product) => {
    try {
      await apiCall(`/inventory/${p.id}/`, {
        method: 'PUT',
        body: JSON.stringify(p)
      });
      toast.success('Product updated');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await apiCall(`/inventory/${id}/`, { method: 'DELETE' });
      toast.success('Product deleted');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const adjustStock = async (productId: string, type: 'IN' | 'OUT', quantity: number, userName: string) => {
    try {
      await apiCall('/transactions/adjust/', {
        method: 'POST',
        body: JSON.stringify({ productId, type, quantity })
      });
      toast.success('Stock adjusted');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, addUser, updateUser, deleteUser, resetPassword, allUsers: users }}>
      <InventoryContext.Provider value={{ products, transactions, searchTerm, setSearchTerm, addProduct, updateProduct, deleteProduct, adjustStock }}>
        {children}
      </InventoryContext.Provider>
    </AuthContext.Provider>
  );
};
