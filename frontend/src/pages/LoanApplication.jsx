import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Send, Sparkles, CheckCircle2, ShieldCheck, 
  Cpu, Lock, Eye, Scale, BarChart2, AlertCircle, ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { formatErrorMessage } from '../utils/errorUtils';

export default function LoanApplication() {
  const [loanAmount, setLoanAmount] = useState('25000');
  const [salary, setSalary] = useState('75000');
  const [creditScore, setCreditScore] = useState('680');
  const [employment, setEmployment] = useState('Salaried');
  const [education, setEducation] = useState('Graduate');
  const [purpose, setPurpose] = useState('Personal');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const workflowSteps = [
    { title: "Consent Verification", desc: "Checking active data consents", icon: Lock },
    { title: "Data Collection Agent", desc: "Ingesting alternative profiles (LinkedIn, Degree, Digital)", icon: Eye },
    { title: "Feature Engineering Agent", desc: "Calculating stability and trust metrics", icon: Cpu },
    { title: "Fraud Detection Agent", desc: "Auditing VPN, email & device anomalies (Isolation Forest)", icon: ShieldCheck },
    { title: "Risk Prediction Agent", desc: "Scoring default probability (XGBoost Classifier)", icon: BarChart2 },
    { title: "Explainability Agent", desc: "Generating SHAP attributions & plain text summary", icon: Sparkles },
    { title: "Compliance Agent", desc: "Verifying 80% rule & zero demographic bias", icon: Scale }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setCurrentStep(0);

    // Simulate animated step progression
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < workflowSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 450);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const res = await axios.post('http://127.0.0.1:8000/api/loan/apply', {
        loan_amount: parseFloat(loanAmount),
        salary: parseFloat(salary),
        credit_score: parseInt(creditScore),
        employment,
        education
      });

      clearInterval(interval);
      setCurrentStep(workflowSteps.length - 1);

      // Short delay for visual completion animation
      setTimeout(() => {
        const appId = res.data.application_id;
        navigate(`/loan/report/${appId}`);
      }, 1000);

    } catch (err) {
      clearInterval(interval);
      setIsSubmitting(false);
      setError(formatErrorMessage(err, 'Loan application submission failed'));
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-8">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Module 3</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-sky-400" />
            Apply for Loan Underwriting
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Submit your financial parameters to initiate real-time AI multi-agent underwriting evaluation.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {isSubmitting ? (
          /* Multi-Agent Orchestration Visualizer */
          <div className="p-8 rounded-2xl bg-[#161f32]/90 border border-indigo-500/30 space-y-6 shadow-2xl">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center glow-active mb-4">
                <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <h2 className="text-xl font-bold text-white">AI Multi-Agent Workflow Running...</h2>
              <p className="text-xs text-slate-400 mt-1">
                Executing 7 specialized agents sequentially for underwriting assessment.
              </p>
            </div>

            <div className="space-y-3 max-w-xl mx-auto pt-2">
              {workflowSteps.map((step, idx) => {
                const IconComp = step.icon;
                const isDone = idx < currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                        : isCurrent
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white glow-active'
                        : 'bg-[#0b0f19]/40 border-[#23304a]/40 text-slate-500'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isDone ? 'bg-emerald-500/20 text-emerald-400' : isCurrent ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>

                    <div className="flex-1">
                      <span className="text-xs font-bold block">{step.title}</span>
                      <span className="text-[10px] text-slate-400 block">{step.desc}</span>
                    </div>

                    {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-[#161f32]/80 border border-[#23304a] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Requested Loan Amount ($)
                </label>
                <input
                  type="number"
                  required
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#23304a] focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                  placeholder="e.g. 25000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Annual Salary / Income ($)
                </label>
                <input
                  type="number"
                  required
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#23304a] focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                  placeholder="e.g. 85000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Traditional Bureau Credit Score
                </label>
                <input
                  type="number"
                  required
                  min="300"
                  max="850"
                  value={creditScore}
                  onChange={(e) => setCreditScore(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#23304a] focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                  placeholder="e.g. 680"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Loan Purpose
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#23304a] focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                >
                  <option value="Personal">Personal Use</option>
                  <option value="Home Improvement">Home Improvement</option>
                  <option value="Debt Consolidation">Debt Consolidation</option>
                  <option value="Business Expansion">Business Expansion</option>
                  <option value="Education">Higher Education</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Employment Status
                </label>
                <select
                  value={employment}
                  onChange={(e) => setEmployment(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#23304a] focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                >
                  <option value="Salaried">Salaried (Full-Time)</option>
                  <option value="Self-Employed">Self-Employed / Business Owner</option>
                  <option value="Freelancer">Freelancer / Independent Contractor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Education Level
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#23304a] focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                >
                  <option value="Graduate">Graduate (Bachelor's Degree)</option>
                  <option value="Post-Graduate">Post-Graduate (Master's / MBA)</option>
                  <option value="Doctorate">Doctorate (Ph.D.)</option>
                  <option value="High School">High School Diploma</option>
                </select>
              </div>

            </div>

            <div className="pt-4 border-t border-[#23304a] flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Alternative data consent will be verified before ingestion.
              </span>
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 shadow-xl shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5"
              >
                <Send className="w-4 h-4" />
                Submit Application to AI Agents
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
