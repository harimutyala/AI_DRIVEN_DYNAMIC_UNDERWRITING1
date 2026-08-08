import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckSquare, Square, Save, ArrowLeft, Info, CheckCircle2, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { formatErrorMessage } from '../utils/errorUtils';

export default function ConsentPage() {
  const [consent, setConsent] = useState({
    employment: false,
    education: false,
    professional: false,
    public_data: false,
    digital_data: false,
    utility_telecom: false,
    bank_cashflow: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchConsent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await axios.get('http://127.0.0.1:8000/api/consent');
      setConsent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsent();
  }, []);

  const handleToggle = (field) => {
    setConsent(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/consent', consent);
      setConsent(res.data);
      setMessage('Consent preferences updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(formatErrorMessage(err, 'Failed to update consent preferences'));
    } finally {
      setSaving(false);
    }
  };

  const consentCategories = [
    {
      key: 'employment',
      title: 'Employment & Payroll Inflows',
      desc: 'Allows ingestion of company tenure, monthly salary verification, and employer stability metrics.',
      boost: '+35 Pts',
      cibilHelp: 'Verifies real earning capability',
      icon: '💼'
    },
    {
      key: 'education',
      title: 'Educational Pedigree & Degrees',
      desc: 'Allows verification of degree level, university tier, and academic performance indicators.',
      boost: '+30 Pts',
      cibilHelp: 'Confirms earning potential for fresh graduates',
      icon: '🎓'
    },
    {
      key: 'professional',
      title: 'Professional Profile (LinkedIn)',
      desc: 'Allows ingestion of verified skills, career longevity, and professional network endorsements.',
      boost: '+25 Pts',
      cibilHelp: 'Establishes professional credibility',
      icon: '👔'
    },
    {
      key: 'utility_telecom',
      title: 'Utility & Telecom Bill Payments',
      desc: 'Ingests electricity, water, and mobile recharge payment history to prove month-on-month financial discipline.',
      boost: '+45 Pts',
      cibilHelp: '🔥 Critical Booster for New-to-Credit & Zero CIBIL Applicants',
      icon: '⚡'
    },
    {
      key: 'bank_cashflow',
      title: 'Bank Cashflow & Monthly Statement',
      desc: 'Analyzes average monthly balance, recurring income frequency, and bounce-free account history.',
      boost: '+50 Pts',
      cibilHelp: '🛡️ Directly Compensates for Existing Pending EMIs or Low Bureau Score',
      icon: '🏦'
    },
    {
      key: 'public_data',
      title: 'Public Records & Legal Filings',
      desc: 'Checks public registry records to confirm zero litigation or insolvency flags.',
      boost: '+15 Pts',
      cibilHelp: 'Ensures zero legal risk',
      icon: '🏛️'
    },
    {
      key: 'digital_data',
      title: 'Digital Behavior & Device Metadata',
      desc: 'Allows verification of email account creation age, device trust fingerprint, and UPI payment frequencies.',
      boost: '+20 Pts',
      cibilHelp: 'Verifies digital trust & identity stability',
      icon: '📱'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Module 2</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-sky-400" />
              Alternative Data Consent Management
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Alternative financial data is only extracted when explicit customer permission is granted.
            </p>
          </div>
        </div>

        {/* Low CIBIL Guidance Callout Banner */}
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-emerald-500/15 border border-amber-500/30 text-slate-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="text-sm font-bold text-amber-300">How Alternative Data Helps New Borrowers & Low CIBIL Applicants</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                If you have <strong className="text-white">no credit score (first-time borrower)</strong>, a <strong className="text-white">low CIBIL score</strong>, or <strong className="text-white">active pending EMIs</strong>, traditional banks reject loan applications automatically. Our AI engine uses your consented alternative data (utility bill payments, bank cashflows, job stability) to award up to <strong className="text-emerald-400">+160 score points</strong> compensation, allowing us to approve your loan fairly!
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {message}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading consent preferences...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                By granting permission to these alternative data sources, our AI feature engineering engine can supplement traditional bureau credit scores to provide a more accurate, personalized underwriting decision.
              </span>
            </div>

            <div className="space-y-3">
              {consentCategories.map((cat) => {
                const isGranted = consent[cat.key];
                return (
                  <div
                    key={cat.key}
                    onClick={() => handleToggle(cat.key)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isGranted
                        ? 'bg-[#161f32] border-indigo-500/50 shadow-lg shadow-indigo-500/5'
                        : 'bg-[#161f32]/40 border-[#23304a]/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            {cat.title}
                          </h3>
                          <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            {cat.boost}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{cat.desc}</p>
                        {cat.cibilHelp && (
                          <span className="inline-block mt-1.5 text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                            {cat.cibilHelp}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {isGranted ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckSquare className="w-4 h-4" /> Consented
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          <Square className="w-4 h-4" /> Revoked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
              >
                Back to Dashboard
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving Preferences...' : 'Save Consent Preferences'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
