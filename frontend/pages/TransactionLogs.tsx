import React, { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownLeft, Calendar, Filter, RotateCcw, ChevronDown } from 'lucide-react';
import Card from '../components/Card';
import { useInventory } from '../context';

const TransactionLogs: React.FC = () => {
  const { transactions, searchTerm } = useInventory();
  
  const [filterType, setFilterType] = useState('All');
  const [filterUser, setFilterUser] = useState('All');
  const [startDate, setStartDate] = useState(''); // Format: YYYY-MM-DD
  const [endDate, setEndDate] = useState('');     // Format: YYYY-MM-DD

  const uniqueUsers = useMemo(() => {
    return ['All', ...Array.from(new Set(transactions.map(tx => tx.user)))];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDateStr = tx.date.split('T')[0];
      
      const matchesSearch = 
        tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.user.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'All' || tx.type === filterType;
      const matchesUser = filterUser === 'All' || tx.user === filterUser;
      
      const matchesStartDate = !startDate || txDateStr >= startDate;
      const matchesEndDate = !endDate || txDateStr <= endDate;

      return matchesSearch && matchesType && matchesUser && matchesStartDate && matchesEndDate;
    });
  }, [transactions, searchTerm, filterType, filterUser, startDate, endDate]);

  const resetFilters = () => {
    setFilterType('All');
    setFilterUser('All');
    setStartDate('');
    setEndDate('');
  };

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "dd/mm/yyyy";
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaction Logs</h1>
          <p className="text-slate-500">History of all stock movements across the system.</p>
        </div>
      </div>

      <Card className="p-4 shadow-sm border-slate-200">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Filter size={16} className="text-sky-500" />
            Advanced Filters
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-sky-500/20"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Authorized By</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white font-medium outline-none focus:ring-2 focus:ring-sky-500/20"
                value={filterUser}
                onChange={e => setFilterUser(e.target.value)}
              >
                {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div className="group flex flex-col">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">From Date</label>
              <div className="relative h-[40px] w-full border border-slate-200 rounded-lg bg-white overflow-hidden transition-all group-hover:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/20">
                {/* Visual Layer - Behind and Click-Through */}
                <div className="absolute inset-0 flex items-center px-3 pointer-events-none z-0">
                  <Calendar size={14} className="text-slate-400 group-hover:text-sky-500 transition-colors" />
                  <span className={`ml-2 text-xs font-medium ${startDate ? 'text-slate-900' : 'text-slate-400'}`}>
                    {formatDateDisplay(startDate)}
                  </span>
                  <div className="flex-1"></div>
                  <ChevronDown size={14} className="text-slate-400 group-hover:text-sky-500 transition-colors" />
                </div>
                
                {/* Functional Layer - Invisible on Top */}
                <input 
                  type="date"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  onClick={(e) => {
                    try { (e.target as any).showPicker(); } catch(err) {}
                  }}
                />
              </div>
            </div>

            <div className="group flex flex-col">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">To Date</label>
              <div className="flex gap-2">
                <div className="relative flex-1 h-[40px] border border-slate-200 rounded-lg bg-white overflow-hidden transition-all group-hover:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/20">
                  {/* Visual Layer */}
                  <div className="absolute inset-0 flex items-center px-3 pointer-events-none z-0">
                    <Calendar size={14} className="text-slate-400 group-hover:text-sky-500 transition-colors" />
                    <span className={`ml-2 text-xs font-medium ${endDate ? 'text-slate-900' : 'text-slate-400'}`}>
                      {formatDateDisplay(endDate)}
                    </span>
                    <div className="flex-1"></div>
                    <ChevronDown size={14} className="text-slate-400 group-hover:text-sky-500 transition-colors" />
                  </div>
                  
                  {/* Functional Layer */}
                  <input 
                    type="date"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    onClick={(e) => {
                      try { (e.target as any).showPicker(); } catch(err) {}
                    }}
                  />
                </div>
                <button 
                  onClick={resetFilters}
                  className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all shrink-0 border border-slate-100"
                  title="Reset Filters"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden shadow-md border-slate-200">
        <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="text-sm font-medium text-slate-500 italic">
            {searchTerm ? `Searching: "${searchTerm}"` : 'Activity History'}
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">
            {filteredTransactions.length} results found
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Qty</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredTransactions.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 font-bold ${log.type === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
                      {log.type === 'IN' ? <ArrowDownLeft size={14} strokeWidth={3} /> : <ArrowUpRight size={14} strokeWidth={3} />}
                      <span className="text-[10px] uppercase tracking-tighter">{log.type === 'IN' ? 'STOCK IN' : 'STOCK OUT'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900">{log.productName}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-bold ${log.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                      {log.type === 'IN' ? '+' : '-'}{log.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <Calendar size={12} className="text-slate-300" />
                      {formatDateTime(log.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                       <span className="truncate">{log.user}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                       <Filter size={40} className="text-slate-200 mb-2" />
                       <p className="text-slate-400 font-medium italic">No logs found matching those filters.</p>
                       <button onClick={resetFilters} className="mt-4 text-sky-600 text-xs font-bold uppercase hover:underline">Clear all filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TransactionLogs;