import React from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Info } from 'lucide-react';

export default function ExplanationCard({ explanation }) {
  if (!explanation) {
    return (
      <div className="p-5 rounded-2xl bg-[#161f32]/80 border border-[#23304a] text-center text-slate-400 text-xs py-8">
        No explainability breakdown available yet.
      </div>
    );
  }

  const { decision, narrative, positive_attributions = [], negative_attributions = [] } = explanation;

  return (
    <div className="p-6 rounded-2xl bg-[#161f32]/80 border border-[#23304a] space-y-5">
      <div className="flex items-center justify-between border-b border-[#23304a] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Explainable AI (SHAP Interpreter)</h3>
            <span className="text-xs text-slate-400">Human-readable credit decision breakdown</span>
          </div>
        </div>

        <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${
          decision === 'Approve'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        }`}>
          {decision === 'Approve' ? 'Approved' : 'Rejected'}
        </span>
      </div>

      {/* Narrative Box */}
      <div className="p-4 rounded-xl bg-[#0b0f19]/80 border border-indigo-500/20 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {narrative}
        </p>
      </div>

      {/* Attribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positive Attributions */}
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-3">
            <ThumbsUp className="w-4 h-4" /> Key Favorable Factors (+ SHAP)
          </h4>
          {positive_attributions.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No significant positive attributions.</span>
          ) : (
            <ul className="space-y-2">
              {positive_attributions.map((factor, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Negative Attributions */}
        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 mb-3">
            <ThumbsDown className="w-4 h-4" /> Limiting Factors (- SHAP)
          </h4>
          {negative_attributions.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No major limiting factors identified.</span>
          ) : (
            <ul className="space-y-2">
              {negative_attributions.map((factor, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
