
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import TransactionLogs from './pages/TransactionLogs';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';

import { useAuth, AppProvider } from './context';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-950">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full"
      />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 1.02 }}
    transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
    className="h-full"
  >
    {children}
  </motion.div>
);

const Layout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      // If resizing to desktop, uncollapse if it was narrow-collapsed
      // or if resizing to mobile, ensure it's hidden (collapsed)
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Dynamic Background Glow */}
      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-sky-200/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200/10 blur-[120px] rounded-full pointer-events-none" />

      <Sidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 custom-scrollbar relative z-10">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="/inventory" element={<PageWrapper><Inventory /></PageWrapper>} />
              <Route path="/logs" element={<PageWrapper><TransactionLogs /></PageWrapper>} />
              <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
              <Route path="/users" element={
                <ProtectedRoute roles={['SUPER_ADMIN']}>
                  <PageWrapper><UserManagement /></PageWrapper>
                </ProtectedRoute>
              } />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Toaster position="top-right" richColors toastOptions={{ style: { borderRadius: '16px' } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        } />
      </Routes>
    </AppProvider>
  );
};

export default App;
