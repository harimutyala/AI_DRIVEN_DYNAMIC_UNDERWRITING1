import React from 'react';

export default function RiskMeter({ score = 650, baseScore = 650, riskCategory = 'Low Risk' }) {
  // Normalize score between 300 and 850
  const minScore = 300;
  const maxScore = 850;
  const normalized = Math.max(0, Math.min(1, (score - minScore) / (maxScore - minScore)));
  
  // Angle from -120 to +120 degrees
  const angle = -120 + normalized * 240;

  // Determine color theme
  let colorClass = 'text-emerald-400';
  let gradientId = 'emeraldGrad';
  let bgGlow = 'rgba(16, 185, 129, 0.2)';
  
  if (score < 600 || riskCategory === 'High Risk') {
    colorClass = 'text-rose-400';
    gradientId = 'roseGrad';
    bgGlow = 'rgba(244, 63, 94, 0.2)';
  } else if (score < 720 || riskCategory === 'Medium Risk') {
    colorClass = 'text-amber-400';
    gradientId = 'amberGrad';
    bgGlow = 'rgba(245, 158, 11, 0.2)';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#161f32]/80 border border-[#23304a] rounded-2xl relative overflow-hidden">
      {/* Background radial glow */}
      <div 
        className="absolute w-40 h-40 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{ background: bgGlow }}
      />

      <div className="relative w-56 h-40 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 200 130">
          <defs>
            <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
          </defs>

          {/* Background Arc */}
          <path
            d="M 30 110 A 70 70 0 1 1 170 110"
            fill="none"
            stroke="#23304a"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Colored Filled Arc */}
          <path
            d="M 30 110 A 70 70 0 1 1 170 110"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="330"
            strokeDashoffset={330 - (330 * normalized)}
            className="transition-all duration-1000 ease-out"
          />

          {/* Needle / Marker */}
          <g transform={`rotate(${angle}, 100, 110)`} className="transition-all duration-1000 ease-out">
            <line x1="100" y1="110" x2="100" y2="48" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="110" r="7" fill="#ffffff" stroke="#0b0f19" strokeWidth="3" />
          </g>
        </svg>

        {/* Center Score Text Overlay */}
        <div className="absolute top-[65px] flex flex-col items-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">{score}</span>
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Risk Score
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-2 flex items-center gap-3">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
          score < 600 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
          score < 720 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>
          {riskCategory}
        </span>
        {baseScore !== score && (
          <span className="text-xs text-slate-400">
            Base Score: <strong className="text-slate-200">{baseScore}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
