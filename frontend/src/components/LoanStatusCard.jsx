import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, ShieldCheck, Clock, XCircle, CheckCircle2 } from 'lucide-react';

export default function LoanStatusCard({ application }) {
  if (!application) {
    return (
      <div className="p-6 rounded-2xl bg-[#161f32]/80 border border-[#23304a] text-center flex flex-col items-center justify-center min-h-[200px]">
        <FileText className="w-10 h-10 text-slate-500 mb-3" />
        <h3 className="text-base font-semibold text-white">No Active Loan Application</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
          Submit your financial and employment information to trigger the multi-agent AI underwriting workflow.
        </p>
        <Link
          to="/loan/apply"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          Start Loan Application
        </Link>
      </div>
    );
  }

  const { application_id, loan_amount, salary, credit_score, employment, status, created_at } = application;

  let statusBadge = {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: Clock,
    text: 'Underwriting Pending'
  };

  if (status === 'Approved') {
    statusBadge = {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: CheckCircle2,
      text: 'Loan Approved'
    };
  } else if (status === 'Rejected') {
    statusBadge = {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: XCircle,
      text: 'Loan Rejected'
    };
  }

  const StatusIcon = statusBadge.icon;

  return (
    <div className="p-6 rounded-2xl bg-[#161f32]/80 border border-[#23304a] relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#23304a]">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Application #{application_id}</span>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            ${loan_amount?.toLocaleString()} <span className="text-xs font-normal text-slate-400">Requested</span>
          </h3>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusBadge.bg} text-xs font-semibold self-start sm:self-auto`}>
          <StatusIcon className="w-4 h-4" />
          <span>{statusBadge.text}</span>
        </div>
      </div>

      {/* Grid of Key Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
        <div className="bg-[#0b0f19]/60 p-3 rounded-xl border border-[#23304a]/50">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Salary</span>
          <span className="text-sm font-bold text-slate-100">${salary?.toLocaleString()}</span>
        </div>

        <div className="bg-[#0b0f19]/60 p-3 rounded-xl border border-[#23304a]/50">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Credit Score</span>
          <span className="text-sm font-bold text-slate-100">{credit_score}</span>
        </div>

        <div className="bg-[#0b0f19]/60 p-3 rounded-xl border border-[#23304a]/50">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Employment</span>
          <span className="text-sm font-bold text-slate-100">{employment}</span>
        </div>

        <div className="bg-[#0b0f19]/60 p-3 rounded-xl border border-[#23304a]/50">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Submitted Date</span>
          <span className="text-sm font-bold text-slate-100">{created_at ? new Date(created_at).toLocaleDateString() : 'Today'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Link
          to={`/loan/report/${application_id}`}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
        >
          <FileText className="w-4 h-4" />
          View Risk & SHAP Report
        </Link>
        <Link
          to={`/fraud/report/${application_id}`}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
        >
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          View Fraud Audit Report
        </Link>
      </div>
    </div>
  );
}
