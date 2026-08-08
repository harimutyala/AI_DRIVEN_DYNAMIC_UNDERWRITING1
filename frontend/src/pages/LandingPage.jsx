import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Sparkles, Brain, Cpu, Zap, ArrowRight, CheckCircle2, 
  Lock, Activity, Scale, Eye, FileText, ChevronRight, BarChart2
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  const agents = [
    { name: "Consent Agent", desc: "Verifies permissions for alternative datasets", icon: Lock, color: "text-amber-400" },
    { name: "Data Collection Agent", desc: "Extracts mock LinkedIn, Degree & Digital profiles", icon: Eye, color: "text-sky-400" },
    { name: "Feature Agent", desc: "Transforms raw data into ML feature vectors", icon: Cpu, color: "text-indigo-400" },
    { name: "Fraud Agent", desc: "Audits VPN, device age & email trust via Isolation Forest", icon: ShieldCheck, color: "text-rose-400" },
    { name: "Risk Agent", desc: "Predicts loan default probability using XGBoost", icon: BarChart2, color: "text-emerald-400" },
    { name: "Explainability Agent", desc: "Translates SHAP values into human-readable narrative", icon: Sparkles, color: "text-purple-400" },
    { name: "Compliance Agent", desc: "Audits model fairness, 80% rule & zero bias", icon: Scale, color: "text-teal-400" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4" /> Next-Gen AI Underwriting Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Dynamic Credit Underwriting Powered by{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
              Multi-Agent AI & SHAP
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Beyond traditional credit scores. Combine customer-consented alternative data, real-time behavioral updates, and Isolation Forest anomaly detection into a dynamic credit decision.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 rounded-xl shadow-xl shadow-indigo-600/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 text-base font-bold text-slate-200 bg-[#161f32] hover:bg-[#1f2d48] border border-[#23304a] rounded-xl transition-all"
            >
              Demo Login
            </Link>
          </div>
        </div>
      </section>

      {/* AI Multi-Agent Architecture */}
      <section className="py-16 bg-[#0b0f19]/60 border-y border-[#23304a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">7-Agent AI Workflow Orchestrator</h2>
            <p className="mt-2 text-sm text-slate-400">
              Every loan application triggers a sequential multi-agent workflow ensuring privacy, security, precision, and compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((agent, index) => {
              const IconComp = agent.icon;
              return (
                <div 
                  key={index}
                  className="p-5 rounded-2xl bg-[#161f32]/80 border border-[#23304a] hover:border-indigo-500/40 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Step 0{index + 1}</span>
                    <IconComp className={`w-5 h-5 ${agent.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{agent.name}</h3>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-[#161f32]/80 border border-[#23304a] space-y-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Dynamic Risk Engine</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unlike static bureau scores, risk scores continuously shift in real-time based on customer monthly salary inflows, repayment history, and behavioral anomaly flags.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161f32]/80 border border-[#23304a] space-y-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">SHAP Explainable AI</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Transparent credit decisions translated into plain English narratives with positive and negative attribution factors for applicant transparency.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161f32]/80 border border-[#23304a] space-y-3">
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 w-fit">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Fairness & Bias Auditing</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automated compliance testing enforcing equal opportunity, disparate impact ratio limits (80% rule), and zero sensitive attribute usage in underwriting models.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#23304a] py-8 bg-[#0b0f19] text-center text-xs text-slate-500">
        <p>© 2026 AI-Powered Dynamic Underwriting Platform • Built for Hackathon MVP Demo</p>
      </footer>
    </div>
  );
}
