import React from 'react';
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function FairnessAuditCard({ auditData }) {
  if (!auditData) return null;

  const { status, audit_criteria = {}, overall_assessment } = auditData;

  const isPassed = status === 'Fairness Passed';

  return (
    <div className="p-6 rounded-2xl bg-[#161f32]/80 border border-[#23304a] space-y-5">
      <div className="flex items-center justify-between border-b border-[#23304a] pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isPassed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Regulatory Fairness & Bias Audit Report</h3>
            <span className="text-xs text-slate-400">Demographic parity & 80% rule compliance</span>
          </div>
        </div>

        <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
          isPassed
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
          {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {status}
        </span>
      </div>

      <p className="text-xs text-slate-300 bg-[#0b0f19]/60 p-3.5 rounded-xl border border-[#23304a] leading-relaxed">
        {overall_assessment}
      </p>

      {/* Criteria Table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(audit_criteria).map(([attr, details]) => (
          <div key={attr} className="p-3 bg-[#0b0f19]/80 rounded-xl border border-[#23304a]/70">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">{attr}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                details.status === 'Passed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {details.status}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">Used in Training: <strong className="text-slate-200">{details.used_in_training ? 'Yes' : 'No'}</strong></span>
            <span className="text-[10px] text-slate-400 block">Disparate Impact: <strong className="text-slate-200">{details.disparate_impact_ratio}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}
