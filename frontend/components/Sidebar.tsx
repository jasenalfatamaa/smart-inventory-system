
import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  Users, 
  UserCircle,
  LogOut,
  Warehouse,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Inventory', icon: Package, path: '/inventory' },
    { name: 'Logs', icon: History, path: '/logs' },
    { name: 'Profile', icon: UserCircle, path: '/profile' },
  ];

  if (user?.role === 'SUPER_ADMIN') {
    menuItems.push({ name: 'Users', icon: Users, path: '/users' });
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isMobile && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCollapsed(true)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45]"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ 
          width: isMobile ? '280px' : (collapsed ? '90px' : '260px'),
          x: isMobile && collapsed ? '-100%' : '0%',
          margin: isMobile ? '0px' : '16px',
          marginRight: '0px'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`
          fixed inset-y-0 left-0 z-50 h-full 
          md:relative md:h-[calc(100vh-32px)] md:inset-auto
        `}
      >
        {/* Main Sidebar Box */}
        <div className={`
          h-full bg-slate-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-hidden relative
          md:rounded-[32px] md:border md:shadow-2xl
        `}>
          {/* Decorative Background Glow */}
          <div className="absolute top-0 left-0 w-full h-32 bg-sky-500/10 blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="p-6 mb-4 flex items-center justify-between relative z-10 shrink-0">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="w-11 h-11 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0"
              >
                <Warehouse className="text-white w-6 h-6" />
              </motion.div>
              {(!collapsed || isMobile) && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-bold text-xl text-white tracking-tight whitespace-nowrap"
                >
                  SmartInv
                </motion.span>
              )}
            </div>
            {/* Close button for mobile */}
            {isMobile && (
              <button onClick={() => setCollapsed(true)} className="p-2 text-slate-400">
                <ChevronRight className="rotate-180" size={20} />
              </button>
            )}
          </div>

          {/* Navigation Rail */}
          <nav className="flex-1 px-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => isMobile && setCollapsed(true)}
                  className={({ isActive }) => `
                    relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group
                    ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
                    ${collapsed && !isMobile ? 'justify-center' : ''}
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-sky-500/5 border-l-4 border-sky-400 rounded-2xl z-0"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <item.icon className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 shrink-0 ${isActive ? 'text-sky-400' : ''}`} />
                  
                  {(!collapsed || isMobile) && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-semibold text-sm relative z-10 whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}

                  {collapsed && !isMobile && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/5 whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Action Bottom Section */}
          <div className="p-4 mt-auto border-t border-white/5 relative z-10 overflow-hidden shrink-0">
            <button
              onClick={logout}
              className={`flex items-center gap-3 w-full px-4 py-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all group ${collapsed && !isMobile ? 'justify-center' : ''}`}
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform shrink-0" />
              {(!collapsed || isMobile) && <span className="font-bold text-sm whitespace-nowrap">Sign Out</span>}
            </button>
          </div>
        </div>

        {/* Floating Toggle Button - Hidden on mobile, only for desktop collapse */}
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: '#f8fafc' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-20 w-7 h-7 bg-white rounded-full hidden md:flex items-center justify-center text-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-200 hover:text-sky-600 transition-colors z-[60]"
        >
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }}>
            <ChevronRight size={14} strokeWidth={3} />
          </motion.div>
        </motion.button>
      </motion.div>
    </>
  );
};

export default Sidebar;
