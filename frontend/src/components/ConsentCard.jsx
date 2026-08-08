import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckSquare, Square, ArrowRight, Zap, Info } from 'lucide-react';

export default function ConsentCard({ consent, onToggle, showEditButton = true }) {
  const items = [
    { key: 'employment', label: 'Employment & Payroll Data', desc: 'Verified income streams & company tenure', boost: '+35 pts' },
    { key: 'education', label: 'Education Credentials', desc: 'Degree tier & academic records', boost: '+30 pts' },
    { key: 'professional', label: 'Professional Profile (LinkedIn)', desc: 'Verified skills & career longevity', boost: '+25 pts' },
    { key: 'utility_telecom', label: 'Utility & Telecom Payments', desc: 'Bill compliance (Crucial for Low/No CIBIL)', boost: '+45 pts' },
    { key: 'bank_cashflow', label: 'Bank Cashflow & Statements', desc: 'Inflow stability (Compensates Pending EMIs)', boost: '+50 pts' },
    { key: 'digital_data', label: 'Digital Behavior & Metadata', desc: 'Device metadata trust & verified email age', boost: '+20 pts' },
    { key: 'public_data', label: 'Public Records', desc: 'Regulatory and corporate registry status', boost: '+15 pts' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-[#161f32]/80 border border-[#23304a] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#23304a] mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Alternative Data Consents</h3>
              <p className="text-[10px] text-slate-400">Boosts credit score for new borrowers & poor CIBIL</p>
            </div>
          </div>
          {showEditButton && (
            <Link
              to="/consent"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Low CIBIL Guidance Box */}
        <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-amber-200">No CIBIL or Low Credit History?</strong> Active consents provide up to <strong className="text-emerald-400">+160 score points</strong> boost to approve your loan!
          </span>
        </div>

        <div className="space-y-2">
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold block">{item.label}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.boost}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                </div>

                <div className="flex items-center gap-1.5 ml-2 shrink-0">
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
