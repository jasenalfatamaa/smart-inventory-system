
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { LogIn, Warehouse, ShieldCheck, ChevronRight, Info } from 'lucide-react';
import { useAuth } from '../context';
import Input from '../components/Input';
import Button from '../components/Button';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Silakan isi semua bidang');
      return;
    }

    setLoading(true);
    const success = await login(identifier, password);
    setLoading(false);

    if (success) {
      toast.success('Selamat datang kembali!');
      navigate('/');
    } else {
      toast.error('Kredensial tidak valid');
    }
  };

  // Explicitly type as Variants and cast "linear" to constant to satisfy Easing type requirements
  const blobVariants: Variants = {
    animate: {
      x: [0, 30, -20, 0],
      y: [0, -50, 20, 0],
      scale: [1, 1.1, 0.9, 1],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "linear" as const
      }
    }
  };

  // Explicitly type as Variants to ensure compatibility with motion components
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  // Explicitly type as Variants to ensure compatibility with motion components
  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] relative overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          variants={blobVariants}
          animate="animate"
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          variants={blobVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" 
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[1000px] grid md:grid-cols-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl z-10 m-4"
      >
        {/* Left Side: Branding & Info */}
        <div className="p-12 flex flex-col justify-between relative bg-gradient-to-br from-sky-500/10 to-transparent border-r border-white/5">
          <div>
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-3 mb-12"
            >
              <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Warehouse className="text-white w-7 h-7" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">SmartInv</span>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.1]">
                Modern Warehouse <span className="text-sky-400">Intelligence.</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-sm">
                Kelola stok Anda lebih efisien dengan bantuan AI dan pelacakan real-time yang akurat.
              </p>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mt-12">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                <ShieldCheck className="text-sky-400" size={20} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Sistem Terenkripsi</p>
                <p className="text-slate-500 text-xs">Keamanan data inventaris terjamin.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 lg:p-12 bg-white flex flex-col justify-center">
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Selamat Datang</h2>
            <p className="text-slate-500 text-sm">Masuk ke akun Anda untuk melanjutkan.</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div variants={itemVariants}>
              <Input
                label="Email atau Username"
                type="text"
                placeholder="Masukkan kredensial Anda"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="focus:scale-[1.01] transition-transform"
                required
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Input
                label="Kata Sandi"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus:scale-[1.01] transition-transform"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <Button
                type="submit"
                className="w-full py-4 text-base font-bold rounded-2xl shadow-xl shadow-sky-500/20 group"
                isLoading={loading}
                icon={<LogIn size={18} className="mr-2 group-hover:translate-x-1 transition-transform" />}
              >
                Masuk Sekarang
              </Button>
            </motion.div>
          </form>

          {/* Collapsible Demo Info */}
          <motion.div variants={itemVariants} className="mt-8 border-t border-slate-100 pt-6">
            <button 
              onClick={() => setShowTips(!showTips)}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-sky-600 transition-colors uppercase tracking-widest"
            >
              <Info size={14} />
              Info Akun Demo
              <ChevronRight size={14} className={`transition-transform duration-300 ${showTips ? 'rotate-90' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showTips && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-sky-200 transition-colors">
                      <p className="text-[10px] font-bold text-slate-400 mb-1">SUPER ADMIN</p>
                      <code className="text-xs text-slate-700 block">superadmin / superadmin123</code>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-sky-200 transition-colors">
                      <p className="text-[10px] font-bold text-slate-400 mb-1">ADMIN GUDANG</p>
                      <code className="text-xs text-slate-700 block">admingudang / admin123</code>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Footer Branding */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 text-slate-500 text-[11px] font-medium tracking-[0.2em] uppercase"
      >
        © 2024 SmartInv System • Built for Excellence
      </motion.p>
    </div>
  );
};

export default Login;
