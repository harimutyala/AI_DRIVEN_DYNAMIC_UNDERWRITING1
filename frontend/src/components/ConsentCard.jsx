import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckSquare, Square, ArrowRight } from 'lucide-react';

export default function ConsentCard({ consent, onToggle, showEditButton = true }) {
  const items = [
    { key: 'employment', label: 'Employment & Payroll Data', desc: 'Verified income streams & company tenure' },
    { key: 'education', label: 'Education Credentials', desc: 'Degree tier & academic records' },
    { key: 'professional', label: 'Professional Profile', desc: 'LinkedIn endorsements & career longevity' },
    { key: 'public_data', label: 'Public Records', desc: 'Regulatory and corporate registry status' },
    { key: 'digital_data', label: 'Digital Behavior', desc: 'Device metadata trust & verified email age' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-[#161f32]/80 border border-[#23304a] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#23304a] mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Customer Data Consents</h3>
          </div>
          {showEditButton && (
            <Link
              to="/consent"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <div className="space-y-2.5">
          {items.map((item) => {
            const isChecked = consent ? consent[item.key] : false;
            return (
              <div
                key={item.key}
                onClick={() => onToggle && onToggle(item.key)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isChecked
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                    : 'bg-[#0b0f19]/50 border-[#23304a]/60 text-slate-400'
                }`}
              >
                <div>
                  <span className="text-xs font-semibold block">{item.label}</span>
                  <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  {isChecked ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      <CheckSquare className="w-3 h-3" /> Granted
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                      <Square className="w-3 h-3" /> Revoked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
