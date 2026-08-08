import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BarChart2, FileText, ArrowLeft, ShieldCheck, Sparkles, 
  CheckCircle2, XCircle, Info, ChevronRight 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import RiskMeter from '../components/RiskMeter';
import ExplanationCard from '../components/ExplanationCard';

export default function RiskReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const [riskRes, appRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/risk/report/${id}`),
        axios.get(`http://127.0.0.1:8000/api/loan/${id}`)
      ]);

      setReport(riskRes.data);
      setApplication(appRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load risk report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
        <Navbar />
        <div className="p-12 text-center text-slate-400">Loading Underwriting Risk Report...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            {error || 'Risk Report not found.'}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { base_score, dynamic_score, risk_category, approved_probability, decision, explanation } = report;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23304a] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-xs text-indigo-400 font-semibold">Application #{id}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3">
              <BarChart2 className="w-8 h-8 text-sky-400" />
              Underwriting Risk & SHAP Report
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/fraud/report/${id}`}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" /> View Fraud Report
            </Link>
          </div>
        </div>

        {/* Top Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Risk Meter Gauge */}
          <div className="md:col-span-1">
            <RiskMeter 
              score={dynamic_score || base_score} 
              baseScore={base_score} 
              riskCategory={risk_category} 
            />
          </div>

          {/* Decision Overview */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-[#161f32]/80 border border-[#23304a] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#23304a]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">XGBoost ML Classification</span>
                <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${
                  decision === 'Approve' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  Final Decision: {decision === 'Approve' ? 'Approved' : 'Rejected'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="bg-[#0b0f19]/70 p-3.5 rounded-xl border border-[#23304a]/70">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Approval Probability</span>
                  <span className="text-2xl font-extrabold text-emerald-400">
                    {(approved_probability * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="bg-[#0b0f19]/70 p-3.5 rounded-xl border border-[#23304a]/70">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Default Risk Category</span>
                  <span className={`text-xl font-extrabold ${
                    risk_category === 'Low Risk' ? 'text-emerald-400' : risk_category === 'Medium Risk' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {risk_category}
                  </span>
                </div>
              </div>
            </div>

            {application && (
              <div className="p-3 bg-[#0b0f19]/40 rounded-xl border border-[#23304a]/50 text-xs text-slate-300 flex items-center justify-between">
                <span>Loan: <strong>${application.loan_amount?.toLocaleString()}</strong></span>
                <span>Salary: <strong>${application.salary?.toLocaleString()}</strong></span>
                <span>Bureau Score: <strong>{application.credit_score}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* SHAP Explanation Card */}
        <ExplanationCard explanation={explanation} />

      </main>
    </div>
  );
}
