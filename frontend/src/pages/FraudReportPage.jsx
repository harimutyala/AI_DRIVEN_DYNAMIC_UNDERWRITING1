import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, ShieldCheck, ArrowLeft, AlertTriangle, 
  CheckCircle2, XCircle, Smartphone, Mail, Globe, Cpu 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import FraudMeter from '../components/FraudMeter';

export default function FraudReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const res = await api.get(`/api/fraud/report/${id}`);
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load fraud report');
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
        <div className="p-12 text-center text-slate-400">Loading Isolation Forest Fraud Report...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            {error || 'Fraud Report not found.'}
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

  const { fraud_score, fraud_probability, fraud_level, anomalies = {} } = report;

  const anomalyChecklist = [
    { key: 'vpn_usage', label: 'VPN / Proxy Network Access', desc: 'Masked IP address or anonymized tunnel', val: anomalies.vpn_usage },
    { key: 'disposable_email', label: 'Disposable Email Domain', desc: 'Temporary mail provider detection', val: anomalies.disposable_email },
    { key: 'impossible_login', label: 'Impossible Geolocation Speed', desc: 'Logins from non-contiguous geographic regions', val: anomalies.impossible_login },
    { key: 'multiple_devices', label: 'Multiple Concurrent Devices', desc: 'Exceeds standard single-device session count', val: anomalies.multiple_devices },
    { key: 'synthetic_profile', label: 'Synthetic Profile Signature', desc: 'Unverified profile & low digital history', val: anomalies.synthetic_profile }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#23304a] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-xs text-indigo-400 font-semibold">Application #{id}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-400" />
              Isolation Forest Fraud Audit Report
            </h1>
          </div>
        </div>

        {/* Top Fraud Gauge */}
        <FraudMeter 
          fraudScore={fraud_score} 
          fraudProbability={fraud_probability} 
          fraudLevel={fraud_level} 
        />

        {/* Anomaly Checklist */}
        <div className="p-6 rounded-2xl bg-[#161f32]/80 border border-[#23304a] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#23304a] pb-3">
            <Cpu className="w-5 h-5 text-indigo-400" />
            Digital Anomaly Audit Checklist
          </h3>

          <div className="space-y-3">
            {anomalyChecklist.map((item) => {
              const isFlagged = Boolean(item.val);
              return (
                <div
                  key={item.key}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    isFlagged
                      ? 'bg-rose-500/10 border-rose-500/30 text-white'
                      : 'bg-[#0b0f19]/60 border-[#23304a]/70 text-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{item.desc}</span>
                  </div>

                  <div className="shrink-0 ml-4">
                    {isFlagged ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        <XCircle className="w-4 h-4" /> Flagged
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Clear
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
