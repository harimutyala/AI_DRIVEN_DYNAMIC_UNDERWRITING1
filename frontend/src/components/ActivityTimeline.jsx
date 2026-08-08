import React from 'react';
import { Activity, Clock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ActivityTimeline({ auditLogs = [] }) {
  if (auditLogs.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-[#161f32]/80 border border-[#23304a] text-center text-slate-400 text-xs py-8">
        No recent audit log history recorded.
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-[#161f32]/80 border border-[#23304a] space-y-4">
      <div className="flex items-center gap-2 border-b border-[#23304a] pb-3">
        <Activity className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Underwriting Audit & Activity Log</h3>
      </div>

      <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#23304a]">
        {auditLogs.slice(0, 8).map((log, idx) => {
          const isSuccess = log.status === 'Success';
          return (
            <div key={log.id || idx} className="flex items-start gap-3 relative pl-8">
              {/* Dot */}
              <div className={`absolute left-1 top-1 w-4 h-4 rounded-full border-2 border-[#0b0f19] flex items-center justify-center ${
                isSuccess ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />

              <div className="flex-1 bg-[#0b0f19]/60 p-3 rounded-xl border border-[#23304a]/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{log.action}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase bg-indigo-500/10 px-1.5 py-0.2 rounded">
                    {log.agent_name}
                  </span>
                  <p className="text-xs text-slate-300 truncate">{log.log_message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
