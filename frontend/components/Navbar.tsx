
import React from 'react';
import { Bell, Search, Menu, X, Command } from 'lucide-react';
import { useAuth, useInventory } from '../context';
import { motion } from 'framer-motion';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { searchTerm, setSearchTerm } = useInventory();

  return (
    <header className="h-20 flex items-center justify-between px-8 shrink-0 z-40 sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <div className="flex items-center gap-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="md:hidden p-3 bg-white text-slate-500 shadow-sm rounded-2xl border border-slate-100"
        >
          <Menu size={20} />
        </motion.button>

        <div className="hidden sm:flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-3 rounded-[20px] border border-white shadow-sm w-72 md:w-96 transition-all focus-within:ring-4 focus-within:ring-sky-500/10 focus-within:border-sky-400/50 group">
          <Search size={18} className="text-slate-400 group-focus-within:text-sky-500 transition-colors" />
          <input
            placeholder="Search products, users..."
            className="bg-transparent border-none outline-none text-sm text-slate-900 w-full placeholder:text-slate-400 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded-md border border-slate-200">
            <Command size={10} className="text-slate-400" />
            <span className="text-[9px] font-bold text-slate-400">K</span>
          </div>
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-red-500 p-1">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ y: -2 }}
          className="relative p-3 bg-white text-slate-500 shadow-sm rounded-2xl border border-slate-100 transition-all hover:text-sky-500"
        >
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </motion.button>

        <div className="h-10 w-px bg-slate-200/60 mx-2"></div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 pl-2 pr-1 py-1 bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-sm cursor-pointer"
        >
          <div className="text-right hidden sm:block pl-2">
            <p className="text-sm font-bold text-slate-900 leading-tight">{user?.name}</p>
            <p className="text-[10px] font-bold text-sky-500 uppercase tracking-tighter">{user?.role.replace('_', ' ')}</p>
          </div>
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=38BDF8&color=fff`}
            alt="avatar"
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-sky-500/10 shadow-md"
          />
        </motion.div>
      </div>
    </header>
  );
};

export default Navbar;
