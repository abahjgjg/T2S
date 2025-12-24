
import React, { useMemo } from 'react';
import { Lead } from '../../types';
import { TrendingUp, Mail, Download } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from '../ToastNotifications';

interface Props {
  leads: Lead[];
}

export const AdminLeads: React.FC<Props> = ({ leads }) => {
  
  const leadGrowthData = useMemo(() => {
    if (leads.length === 0) return [];
    
    // Group by date
    const groups: Record<string, number> = {};
    const sortedLeads = [...leads].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    let cumulative = 0;
    sortedLeads.forEach(lead => {
      const date = new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      cumulative += 1;
      // Overwrite date key with latest cumulative count for that day
      groups[date] = cumulative;
    });

    return Object.keys(groups).map(date => ({ date, count: groups[date] }));
  }, [leads]);

  const downloadCSV = () => {
    if (!leads.length) {
      toast.info("No data to export");
      return;
    }
    const headers = Object.keys(leads[0]);
    const csvContent = [
      headers.join(','),
      ...leads.map(row => headers.map(fieldName => {
        // @ts-ignore
        const val = row[fieldName];
        return `"${val}"`;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'captured_leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV Exported");
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
           <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Leads</h4>
           <p className="text-4xl font-black text-white">{leads.length}</p>
         </div>
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
           <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
             <TrendingUp className="w-4 h-4" /> Growth Over Time
           </h4>
           <div className="h-32 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={leadGrowthData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} 
                  />
                  <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
         </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
         <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" /> Captured Emails
            </h4>
            <button 
              onClick={downloadCSV}
              className="text-xs flex items-center gap-1 text-slate-400 hover:text-white"
            >
              <Download className="w-3 h-3" /> Export CSV
            </button>
         </div>
         <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto custom-scrollbar">
            {leads.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No leads captured yet.</div>
            ) : (
              leads.map((lead, idx) => (
                <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-800/30">
                   <div>
                     <p className="font-mono text-sm text-white">{lead.email}</p>
                     <p className="text-xs text-slate-500">
                       Interested in: <span className="text-emerald-400">{lead.sourceTitle || 'General'}</span>
                     </p>
                   </div>
                   <span className="text-xs text-slate-500">
                     {new Date(lead.createdAt).toLocaleDateString()}
                   </span>
                </div>
              ))
            )}
         </div>
      </div>
    </div>
  );
};
