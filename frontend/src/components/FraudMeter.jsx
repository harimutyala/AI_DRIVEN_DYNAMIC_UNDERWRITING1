import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function FraudMeter({ fraudScore = 0.05, fraudProbability = 0.05, fraudLevel = 'Low' }) {
  // Fraud score display 0 - 100
  const scorePercent = Math.round(fraudScore * 100);

  let statusConfig = {
    label: 'Low Fraud Risk',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    icon: ShieldCheck,
    barColor: 'bg-emerald-500',
    desc: 'Digital footprint verified. No suspicious device or network anomalies detected.'
  };

  if (fraudLevel === 'High' || scorePercent > 60) {
    statusConfig = {
      label: 'High Fraud Risk Flag',
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      icon: ShieldAlert,
      barColor: 'bg-rose-500',
      desc: 'Multiple anomaly indicators detected (VPN usage, disposable email, or device mismatches).'
    };
  } else if (fraudLevel === 'Medium' || scorePercent > 30) {
    statusConfig = {
      label: 'Medium Anomaly Level',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      icon: AlertTriangle,
      barColor: 'bg-amber-500',
      desc: 'Slight device metadata discrepancies detected. Secondary verification recommended.'
    };
  }

  const IconComp = statusConfig.icon;

  return (
    <div className={`p-5 rounded-2xl bg-[#161f32]/80 border ${statusConfig.borderColor} relative overflow-hidden flex flex-col justify-between`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${statusConfig.bgColor} ${statusConfig.color}`}>
            <IconComp className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Isolation Forest Fraud Engine</h4>
            <span className={`text-xs font-bold ${statusConfig.color}`}>{statusConfig.label}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-white">{scorePercent}%</span>
          <span className="block text-[10px] text-slate-400 uppercase">Anomaly Score</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="my-4">
        <div className="w-full bg-[#0b0f19] h-2 rounded-full overflow-hidden p-0.5 border border-[#23304a]">
          <div 
            className={`h-full rounded-full transition-all duration-700 ${statusConfig.barColor}`}
            style={{ width: `${Math.max(5, Math.min(100, scorePercent))}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">{statusConfig.desc}</p>
    </div>
  );
}
