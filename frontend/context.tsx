
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

// --- Mock Data ---
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'MacBook Pro M3 14"', category: 'Electronics', sku: 'LAP-001', stock: 12, minStock: 10, price: 1999, lastUpdated: '2023-11-10' },
  { id: '2', name: 'iPhone 15 Pro Max', category: 'Electronics', sku: 'PHN-001', stock: 5, minStock: 8, price: 1199, lastUpdated: '2023-11-12' },
  { id: '3', name: 'Logitech MX Master 3S', category: 'Peripherals', sku: 'ACC-001', stock: 0, minStock: 5, price: 99, lastUpdated: '2023-11-08' },
  { id: '4', name: 'Dell UltraSharp 27"', category: 'Monitors', sku: 'MON-001', stock: 25, minStock: 10, price: 450, lastUpdated: '2023-11-01' },
  { id: '5', name: 'Herman Miller Aeron', category: 'Furniture', sku: 'FUR-001', stock: 8, minStock: 5, price: 1200, lastUpdated: '2023-10-25' },
];

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Super Admin', username: 'superadmin', email: 'superadmin@example.com', role: 'SUPER_ADMIN', avatar: 'https://picsum.photos/id/64/100/100', phone: '08123456789', pob: 'Jakarta', dob: '1990-01-01' },
  { id: '2', name: 'Admin Gudang', username: 'admingudang', email: 'admin@example.com', role: 'ADMIN', avatar: 'https://picsum.photos/id/65/100/100', phone: '08987654321', pob: 'Bandung', dob: '1995-05-15' },
];

const SEED_LOGS: Transaction[] = [
  { id: 'l1', productId: '1', productName: 'MacBook Pro', type: 'IN', quantity: 20, date: new Date(Date.now() - 86400000 * 2).toISOString(), user: 'Super Admin' },
  { id: 'l2', productId: '1', productName: 'MacBook Pro', type: 'OUT', quantity: 5, date: new Date(Date.now() - 86400000 * 1).toISOString(), user: 'Admin Gudang' },
  { id: 'l3', productId: '2', productName: 'iPhone 15', type: 'IN', quantity: 15, date: new Date(Date.now() - 86400000 * 5).toISOString(), user: 'Super Admin' },
];

// --- Providers ---
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false, isLoading: true });
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [passwords, setPasswords] = useState<Record<string, string>>({
    'superadmin@example.com': 'superadmin123',
    'superadmin': 'superadmin123',
    'admin@example.com': 'admin123',
    'admingudang': 'admin123'
  });

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_LOGS);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('inventory_user');
    if (savedUser) {
      setAuth({ user: JSON.parse(savedUser), isAuthenticated: true, isLoading: false });
    } else {
      setAuth(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (identifier: string, pass: string) => {
    const foundUser = users.find(u => u.email === identifier || u.username === identifier);
    if (foundUser && (passwords[foundUser.email] === pass || passwords[foundUser.username] === pass)) {
      setAuth({ user: foundUser, isAuthenticated: true, isLoading: false });
      localStorage.setItem('inventory_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuth({ user: null, isAuthenticated: false, isLoading: false });
    localStorage.removeItem('inventory_user');
  };

  const addUser = (user: User, pass: string) => {
    setUsers(prev => [...prev, user]);
    setPasswords(prev => ({ ...prev, [user.email]: pass, [user.username]: pass }));
    toast.success('User added');
  };

  const updateUser = (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (auth.user?.id === updated.id) {
       setAuth(prev => ({ ...prev, user: updated }));
       localStorage.setItem('inventory_user', JSON.stringify(updated));
    }
  };

  const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

  const resetPassword = (email: string, newPass: string) => {
    const u = users.find(user => user.email === email);
    if (u) {
      setPasswords(prev => ({ ...prev, [u.email]: newPass, [u.username]: newPass }));
      toast.success(`Password for ${u.name} has been reset.`);
    }
  };

  const addProduct = (p: Product) => {
    setProducts(prev => [p, ...prev]);
    
    // If initial stock is provided, record it as a transaction
    if (p.stock > 0) {
      const initLog: Transaction = {
        id: `log_init_${Date.now()}`,
        productId: p.id,
        productName: p.name,
        type: 'IN',
        quantity: p.stock,
        date: new Date().toISOString(),
        user: auth.user?.name || 'System'
      };
      setTransactions(prev => [initLog, ...prev]);
    }
  };

  const updateProduct = (p: Product) => setProducts(prev => prev.map(item => item.id === p.id ? p : item));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(item => item.id !== id));

  const adjustStock = (productId: string, type: 'IN' | 'OUT', quantity: number, userName: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newStock = type === 'IN' ? p.stock + quantity : Math.max(0, p.stock - quantity);
        const newLog: Transaction = {
          id: `log_${Date.now()}`,
          productId: p.id,
          productName: p.name,
          type,
          quantity,
          date: new Date().toISOString(),
          user: userName
        };
        setTransactions(prevLogs => [newLog, ...prevLogs]);
        return { ...p, stock: newStock, lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return p;
    }));
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, addUser, updateUser, deleteUser, resetPassword, allUsers: users }}>
      <InventoryContext.Provider value={{ products, transactions, searchTerm, setSearchTerm, addProduct, updateProduct, deleteProduct, adjustStock }}>
        {children}
      </InventoryContext.Provider>
    </AuthContext.Provider>
  );
};
