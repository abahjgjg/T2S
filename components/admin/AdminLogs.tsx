
import React, { useState, useEffect } from 'react';
import { telemetryService, SystemLog } from '../../services/telemetryService';
import { Trash2, RefreshCcw, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    setLogs(telemetryService.getLogs());
  };

  const handleClear = () => {
    if (window.confirm("Clear all logs?")) {
      telemetryService.clearLogs();
      loadLogs();
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'WARN': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">System Telemetry</h3>
          <p className="text-sm text-slate-400">Recent client-side errors and warnings.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadLogs}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
          <button 
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No logs recorded. System is healthy.
          </div>
        ) : (
          <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto custom-scrollbar">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {getLevelIcon(log.level)}
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      log.level === 'ERROR' ? 'bg-red-900/20 text-red-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {log.context}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-300 font-mono break-all mt-1 pl-6">
                  {log.message}
                </p>
                {log.stack && (
                  <details className="mt-2 pl-6">
                    <summary className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-300">View Stack Trace</summary>
                    <pre className="text-[10px] text-slate-500 bg-slate-950 p-2 rounded mt-1 overflow-x-auto">
                      {log.stack}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
