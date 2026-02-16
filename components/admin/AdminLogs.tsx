
import React, { useState, useEffect } from 'react';
import { telemetryService, SystemLog } from '../../services/telemetryService';
import { Trash2, RefreshCcw, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useConfirm } from '../../contexts/ConfirmContext';
import { ICON_SIZES } from '../../constants/designTokens';
import { DIMENSIONS } from '../../constants/dimensionConfig';
import { TYPOGRAPHY_PRESETS, FONT_SIZES, FONT_WEIGHTS, TEXT_COLORS } from '../../constants/typography';

export const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const { confirm } = useConfirm();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    setLogs(telemetryService.getLogs());
  };

  const handleClear = async () => {
    const confirmed = await confirm({
      title: 'Clear All Logs?',
      message: 'This will permanently delete all system logs. This action cannot be undone.',
      confirmText: 'Clear Logs',
      cancelText: 'Keep Logs',
      variant: 'danger',
    });
    if (confirmed) {
      telemetryService.clearLogs();
      loadLogs();
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return <AlertCircle className={`${ICON_SIZES.md} text-red-500`} />;
      case 'WARN': return <AlertTriangle className={`${ICON_SIZES.md} text-amber-500`} />;
      default: return <Info className={`${ICON_SIZES.md} text-blue-500`} />;
    }
  };

  return (
    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={TYPOGRAPHY_PRESETS.h4}>System Telemetry</h3>
          <p className={`${FONT_SIZES.sm} ${TEXT_COLORS.slate[400]}`}>Recent client-side errors and warnings.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadLogs}
            className={`flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 ${TEXT_COLORS.white} rounded-lg ${FONT_SIZES.xs} ${FONT_WEIGHTS.bold} transition-colors`}
          >
            <RefreshCcw className={ICON_SIZES.md} /> Refresh
          </button>
          <button 
            onClick={handleClear}
            className={`flex items-center gap-2 px-3 py-2 bg-red-900/20 hover:bg-red-900/30 ${TEXT_COLORS.status.error} border border-red-500/30 rounded-lg ${FONT_SIZES.xs} ${FONT_WEIGHTS.bold} transition-colors`}
          >
            <Trash2 className={ICON_SIZES.md} /> Clear
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {logs.length === 0 ? (
          <div className={`p-12 text-center ${TEXT_COLORS.slate[500]}`}>
            No logs recorded. System is healthy.
          </div>
        ) : (
          <div className="divide-y divide-slate-800 overflow-y-auto custom-scrollbar" style={{ maxHeight: DIMENSIONS.admin.logsMaxHeight }}>
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {getLevelIcon(log.level)}
                    <span className={`${FONT_SIZES.xs} ${FONT_WEIGHTS.bold} px-1.5 py-0.5 rounded ${
                      log.level === 'ERROR' ? 'bg-red-900/20 ' + TEXT_COLORS.status.error : 'bg-slate-800 ' + TEXT_COLORS.slate[400]
                    }`}>
                      {log.context}
                    </span>
                    <span className={`${FONT_SIZES.xs} ${TEXT_COLORS.slate[500]} font-mono`}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className={`${FONT_SIZES.sm} ${TEXT_COLORS.slate[300]} font-mono break-all mt-1 pl-6`}>
                  {log.message}
                </p>
                {log.stack && (
                  <details className="mt-2 pl-6">
                    <summary className={`${FONT_SIZES['2xs']} ${TEXT_COLORS.slate[500]} cursor-pointer hover:${TEXT_COLORS.slate[300]}`}>View Stack Trace</summary>
                    <pre className={`${FONT_SIZES['2xs']} ${TEXT_COLORS.slate[500]} bg-slate-950 p-2 rounded mt-1 overflow-x-auto`}>
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
