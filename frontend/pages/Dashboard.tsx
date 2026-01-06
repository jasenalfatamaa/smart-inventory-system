
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  XCircle, 
  BrainCircuit, 
  RefreshCw,
  Search,
  ArrowRight,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import { getAIInventoryInsights } from '../geminiService';
import { useInventory } from '../context';
import StockBadge from '../components/StockBadge';

const Dashboard: React.FC = () => {
  const { products, transactions, searchTerm } = useInventory();
  const [timeRange, setTimeRange] = useState('1W');
  const [aiInsights, setAiInsights] = useState<string>('Analysing your inventory data...');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 4); 
  }, [searchTerm, products]);

  const alerts = useMemo(() => {
    return products
      .filter(p => p.stock < p.minStock)
      .sort((a, b) => a.stock - b.stock); 
  }, [products]);

  // Robust date mapping for chart
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    let daysCount = 7;
    if (timeRange === '1M') daysCount = 30;
    else if (timeRange === '3M') daysCount = 90;
    else if (timeRange === '6M') daysCount = 180;
    else if (timeRange === '1Y') daysCount = 365;

    const getLocalDateKey = (date: Date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const transactionMap: Record<string, { in: number, out: number }> = {};
    
    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      const dateKey = getLocalDateKey(txDate);
      if (!transactionMap[dateKey]) transactionMap[dateKey] = { in: 0, out: 0 };
      if (tx.type === 'IN') transactionMap[dateKey].in += tx.quantity;
      else transactionMap[dateKey].out += tx.quantity;
    });

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = getLocalDateKey(d);
      
      const label = daysCount <= 7 
        ? d.toLocaleDateString('id-ID', { weekday: 'short' })
        : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

      data.push({
        name: label,
        fullDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        in: transactionMap[dateKey]?.in || 0,
        out: transactionMap[dateKey]?.out || 0,
      });
    }
    return data;
  }, [timeRange, transactions]);

  const stats = useMemo(() => {
    const totalSku = products.length;
    const assetValue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock < p.minStock).length;
    const outOfStock = products.filter(p => p.stock <= 0).length;
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    return [
      { label: 'Total Products', value: totalSku.toString(), icon: Package, color: 'text-sky-500', bg: 'bg-sky-50' },
      { label: 'Asset Value', value: formatter.format(assetValue), icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
      { label: 'Low Stock', value: lowStock.toString(), icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
      { label: 'Out of Stock', value: outOfStock.toString(), icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    ];
  }, [products]);

  const fetchInsights = async () => {
    setIsAiLoading(true);
    const text = await getAIInventoryInsights(products);
    setAiInsights(text);
    setIsAiLoading(false);
  };

  useEffect(() => { fetchInsights(); }, [products.length]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Live inventory monitoring and AI analysis.</p>
        </div>
      </div>

      {searchTerm && (
        <Card glass className="border-sky-200 bg-sky-50/30">
          <div className="flex items-center gap-2 mb-4">
            <Search className="text-sky-500" size={18} />
            <h3 className="font-bold text-slate-900">Quick Search Results: "{searchTerm}"</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {searchResults.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                  <StockBadge status={p.stock <= 0 ? 'Out of Stock' : p.stock < p.minStock ? 'Low' : 'Safe'} />
                </div>
                <div className="flex justify-between items-end mt-2">
                   <p className="text-xs text-slate-500">Stock: <span className="font-bold text-slate-900">{p.stock}</span></p>
                   <Link to="/inventory" className="text-xs text-sky-600 font-bold flex items-center gap-1 hover:underline">
                      Manage <ArrowRight size={12} />
                   </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[600px]">
        {/* Main Chart Column */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-slate-900">Real-time Stock Movements</h3>
                <p className="text-xs text-slate-400">Activity trends for the selected period</p>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 shadow-sm">
                {['1W', '1M', '3M', '6M', '1Y'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all whitespace-nowrap ${timeRange === range ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.05}/>
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Area name="Stock In" type="monotone" dataKey="in" stroke="#38BDF8" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" animationDuration={1000} />
                  <Area name="Stock Out" type="monotone" dataKey="out" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorOut)" animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Sidebar Alerts & AI Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Low Stock Alert Panel */}
          <Card className="flex flex-col flex-1 border-amber-100 bg-gradient-to-br from-white to-amber-50/20">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} />
                <h3 className="font-bold text-slate-900">Stock Alerts</h3>
              </div>
              {alerts.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-4 ring-amber-50">
                  {alerts.length} ITEMS
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 min-h-[150px]">
              <AnimatePresence mode="popLayout">
                {alerts.length > 0 ? (
                  alerts.map(p => (
                    <motion.div 
                      key={p.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-xl border flex items-center justify-between group transition-all hover:shadow-md bg-white ${p.stock <= 0 ? 'border-red-100 bg-red-50/10' : 'border-slate-100'}`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                        <p className="text-[10px] font-medium text-slate-500">
                          Qty: <span className={p.stock <= 0 ? 'text-red-500 font-bold' : 'text-amber-600 font-bold'}>{p.stock}</span> 
                          <span className="mx-1">/</span> 
                          Min: {p.minStock}
                        </p>
                      </div>
                      <Link to="/inventory" className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-[#38BDF8] hover:text-white transition-all shrink-0">
                        <ShoppingBag size={14} />
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-6">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2">
                       <CheckCircle2 size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-900">All Stock Safe</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
            {alerts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 shrink-0">
                <Link to="/inventory" className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center justify-center gap-1 hover:gap-2 transition-all">
                  Restock Now <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </Card>

          {/* AI Insights Panel */}
          <Card glass className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <BrainCircuit className="text-sky-500" size={20} />
                <h3 className="font-bold text-slate-900">AI Analysis</h3>
              </div>
              <button onClick={fetchInsights} disabled={isAiLoading} className="p-1.5 text-slate-400 hover:text-sky-500 transition-all">
                <RefreshCw size={16} className={isAiLoading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[120px]">
              {isAiLoading ? (
                 <div className="space-y-3">
                   <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4"></div>
                   <div className="h-3 bg-slate-100 rounded animate-pulse w-full"></div>
                   <div className="h-3 bg-slate-100 rounded animate-pulse w-5/6"></div>
                 </div>
              ) : (
                 <div className="bg-white/40 p-4 rounded-xl border border-white/60">
                   <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap italic">
                     "{aiInsights}"
                   </p>
                 </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
