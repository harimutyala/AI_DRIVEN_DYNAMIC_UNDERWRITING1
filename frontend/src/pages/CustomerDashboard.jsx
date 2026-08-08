import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, ReferenceLine, CartesianGrid } from 'recharts';
import { 
  ShieldCheck, ShieldAlert, Sparkles, Send, RefreshCw, BarChart2, CheckCircle, 
  AlertTriangle, Play, HelpCircle, FileText, UserCheck, Smartphone, Eye, LogOut 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { formatErrorMessage } from '../utils/errorUtils';

export default function CustomerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Consent states
  const [consent, setConsent] = useState({
    employment: false,
    education: false,
    professional: false,
    public_data: false,
    digital_data: false
  });
  
  // Apply Loan States
  const [loanAmount, setLoanAmount] = useState('25000');
  const [salary, setSalary] = useState('65000');
  const [creditScore, setCreditScore] = useState('650');
  const [employment, setEmployment] = useState('Salaried');
  const [education, setEducation] = useState('Graduate');
  const [submittingApp, setSubmittingApp] = useState(false);

  // Simulation States
  const [simMonth, setSimMonth] = useState('1');
  const [simSalary, setSimSalary] = useState(true);
  const [simRepayment, setSimRepayment] = useState('On-Time');
  const [simAnomaly, setSimAnomaly] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const navigate = useNavigate();
  const userName = data?.user_name || localStorage.getItem('name') || 'Applicant';

  const fetchData = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/dashboard');
      if (res.data.role !== 'customer') {
        navigate('/admin');
        return;
      }
      setData(res.data);
      if (res.data.consent) {
        setConsent(res.data.consent);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError(formatErrorMessage(err, 'Failed to fetch dashboard metrics.'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSaveConsent = async () => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/consent', consent);
      fetchData();
    } catch (err) {
      alert('Error updating consent: ' + (err.response?.data?.detail || err.message));
    }
  };

  const submitLoanApplication = async (e) => {
    e.preventDefault();
    setSubmittingApp(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/loan/apply', {
        loan_amount: parseFloat(loanAmount),
        salary: parseFloat(salary),
        credit_score: parseInt(creditScore),
        employment,
        education
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Application error');
    } finally {
      setSubmittingApp(false);
    }
  };

  const triggerSimulation = async () => {
    setSimulating(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/behaviour/simulate', null, {
        params: {
          month: parseInt(simMonth),
          salary_received: simSalary,
          repayment_history: simRepayment,
          abnormal_behavior_flag: simAnomaly
        }
      });
      // Increment month state automatically for next click
      setSimMonth((prev) => String(parseInt(prev) + 1));
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Simulation error');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-text">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-10 w-10 text-brand-primary animate-spin" />
          <p className="font-semibold text-brand-muted">Loading Aegis Systems...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-text px-4">
        <div className="glass-panel rounded-2xl border border-brand-border/60 p-8 max-w-md text-center">
          <h2 className="text-xl font-extrabold text-white mb-3">Dashboard unavailable</h2>
          <p className="text-sm text-brand-muted mb-6">
            We could not load your underwriting dashboard. Please sign in again and retry.
          </p>
          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
            className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Formatting SHAP values for horizontal bar charts
  const shapData = [];
  if (data?.explanation?.shap_values) {
    const rawVal = data.explanation.shap_values;
    const labelMapping = {
      credit_score: 'Traditional Score',
      salary: 'Income Level',
      loan_amount: 'Requested Loan',
      job_stability_score: 'Job Stability',
      education_score: 'Education Level',
      linkedin_score: 'LinkedIn Profile',
      device_trust_score: 'Device Trust',
      email_trust_score: 'Email Trust'
    };
    
    Object.keys(rawVal).forEach(k => {
      shapData.push({
        name: labelMapping[k] || k,
        influence: parseFloat((rawVal[k] * 100).toFixed(2)) // Percent change
      });
    });
  }

  // Dynamic scores dial settings
  const dynamicScore = data?.risk_report?.dynamic_score || 500;
  const baseScore = data?.risk_report?.base_score || 500;
  const scorePercent = ((dynamicScore - 300) / 550) * 100;
  
  // Fraud colors
  const fraudLevel = data?.fraud_report?.fraud_level || 'Low';
  const fraudScore = data?.fraud_report?.fraud_probability || 0.0;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pb-16">
      <Navbar />

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-[#161f32] border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Customer Portal</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">{data?.email || localStorage.getItem('email')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Welcome back, {userName}!
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {data?.loan_status === 'NoApplication'
                ? 'Fill out your financial details below to trigger the 7-agent AI underwriting evaluation.'
                : `Your active loan application #${data?.loan_details?.application_id} is ${data?.loan_status}. Track your real-time risk scores and SHAP explainability breakdown below.`}
            </p>
          </div>

          {data?.loan_status === 'NoApplication' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoanAmount('35000');
                  setSalary('92000');
                  setCreditScore('710');
                  setEmployment('Salaried');
                  setEducation('Graduate');
                }}
                className="px-4 py-2.5 text-xs font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" /> ⚡ Fill Sample Details
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid Layout Dashboard */}
      <div className="max-w-7xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Application and Consent */}
        <div className="space-y-8 lg:col-span-1">
          
          {/* Card 1: Consent Management */}
          <div className="glass-panel rounded-2xl p-6 border border-brand-border/60 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-6 w-6 text-brand-primary" />
              <h2 className="font-extrabold text-lg tracking-wide">Alternative Data Consents</h2>
            </div>
            <p className="text-xs text-brand-muted mb-5 leading-relaxed font-medium">
              We cannot access alternative profile data to boost your credit decision without explicit permission. Toggle consents below to connect verification sources.
            </p>
            <div className="space-y-3 mb-6">
              {[
                { key: 'professional', label: 'LinkedIn Profile' },
                { key: 'employment', label: 'Employment Stability Verification' },
                { key: 'education', label: 'Education Quality (University Tier)' },
                { key: 'digital_data', label: 'Digital Behavioral Metrics' },
                { key: 'public_data', label: 'Public Information' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between p-3 rounded-xl bg-brand-bg/50 border border-brand-border/40 hover:border-brand-primary/20 transition-all cursor-pointer">
                  <span className="text-sm font-semibold">{label}</span>
                  <input 
                    type="checkbox" 
                    className="h-5 w-5 rounded border-brand-border accent-brand-primary focus:ring-brand-primary text-brand-bg"
                    checked={consent[key]}
                    onChange={(e) => setConsent(prev => ({ ...prev, [key]: e.target.checked }))}
                  />
                </label>
              ))}
            </div>
            <button
              onClick={handleSaveConsent}
              className="w-full py-2 bg-brand-primary hover:brightness-110 text-brand-text font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer"
            >
              Update Consent Settings
            </button>
          </div>

          {/* Card 2: Application Form or Status */}
          {data?.loan_status === 'NoApplication' ? (
            <div className="glass-panel rounded-2xl p-6 border border-brand-border/60 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-6 w-6 text-brand-secondary" />
                <h2 className="font-extrabold text-lg tracking-wide">Submit Loan Application</h2>
              </div>
              <form onSubmit={submitLoanApplication} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1">Loan Amount ($)</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-brand-text font-semibold focus:outline-none focus:border-brand-secondary"
                    value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1">Yearly Salary ($)</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-brand-text font-semibold focus:outline-none focus:border-brand-secondary"
                    value={salary} onChange={(e) => setSalary(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1">Traditional Bureau Score</label>
                  <input 
                    type="number" min="300" max="850"
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-brand-text font-semibold focus:outline-none focus:border-brand-secondary"
                    value={creditScore} onChange={(e) => setCreditScore(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-brand-muted mb-1">Employment Status</label>
                    <select 
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-brand-text font-semibold focus:outline-none"
                      value={employment} onChange={(e) => setEmployment(e.target.value)}
                    >
                      <option value="Salaried">Salaried</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Unemployed">Unemployed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-muted mb-1">Education Level</label>
                    <select 
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-brand-text font-semibold focus:outline-none"
                      value={education} onChange={(e) => setEducation(e.target.value)}
                    >
                      <option value="Undergrad">Undergrad</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Postgrad">Postgraduate</option>
                      <option value="Doctorate">Doctorate</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit" disabled={submittingApp}
                  className="w-full py-3 bg-gradient-to-r from-brand-secondary to-brand-primary hover:brightness-110 text-brand-text font-extrabold rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  {submittingApp ? 'Processing Agents...' : 'Submit Application'}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-6 border border-brand-border/60 shadow-md">
              <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block mb-1">Application File</span>
              <h3 className="font-extrabold text-2xl mb-4">File #{data?.loan_details?.application_id}</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-brand-border/40 pb-2">
                  <span className="text-sm font-semibold text-brand-muted">Status</span>
                  <span className={`text-sm font-extrabold px-3 py-0.5 rounded-full ${
                    data?.loan_status === 'Approved' ? 'bg-brand-success/10 text-brand-success border border-brand-success/30' :
                    data?.loan_status === 'Rejected' ? 'bg-brand-danger/10 text-brand-danger border border-brand-danger/30' :
                    'bg-brand-warning/10 text-brand-warning border border-brand-warning/30'
                  }`}>{data?.loan_status}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 pb-2">
                  <span className="text-sm font-semibold text-brand-muted">Amount Requested</span>
                  <span className="text-sm font-bold text-brand-text">${data?.loan_details?.loan_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 pb-2">
                  <span className="text-sm font-semibold text-brand-muted">Declared Income</span>
                  <span className="text-sm font-bold text-brand-text">${data?.loan_details?.salary.toLocaleString()} /yr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-brand-muted">Bureau Score</span>
                  <span className="text-sm font-bold text-brand-text">{data?.loan_details?.credit_score}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center / Right Columns: Score meters, SHAP values, alternative profiles, simulation */}
        <div className="lg:col-span-2 space-y-8">
          
          {data?.loan_status !== 'NoApplication' && (
            <>
              {/* Row 1: Underwriting Score Indicators (Gauges) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Meter 1: Dynamic Credit Score */}
                <div className="glass-panel rounded-2xl p-6 border border-brand-border/60 shadow-md flex flex-col items-center select-none relative overflow-hidden">
                  <div className="absolute top-2 right-3 font-semibold text-[10px] bg-brand-primary/10 text-brand-primary border border-brand-primary/30 px-2 py-0.5 rounded-md">
                    Module 9 Engine
                  </div>
                  <h3 className="font-extrabold text-sm tracking-wide text-brand-muted self-start mb-6 uppercase">Dynamic Risk Score</h3>
                  
                  {/* Gauge representation */}
                  <div className="relative w-44 h-24 flex items-end justify-center mb-4">
                    {/* Ring background */}
                    <div className="absolute inset-0 rounded-t-full border-8 border-brand-border/50" />
                    {/* Ring filler */}
                    <div 
                      className="absolute inset-0 rounded-t-full border-8 border-t-brand-primary border-r-brand-primary transition-all duration-1000 origin-bottom" 
                      style={{
                        borderColor: '#6366f1',
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                        transform: `rotate(${Math.min(180, (scorePercent * 1.8) - 180)}deg)`
                      }}
                    />
                    
                    <div className="text-center z-10">
                      <p className="text-4xl font-extrabold text-brand-text -mb-1">{dynamicScore}</p>
                      <p className={`text-xs font-bold ${
                        dynamicScore >= 700 ? 'text-brand-success' :
                        dynamicScore >= 550 ? 'text-brand-warning' :
                        'text-brand-danger'
                      }`}>
                        {data?.risk_report?.risk_category} Risk
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-brand-muted font-semibold w-full justify-between px-3 border-t border-brand-border/30 pt-3">
                    <span>Base Score: <strong className="text-brand-text">{baseScore}</strong></span>
                    <span>Approval Prob: <strong className="text-brand-text">{Math.round((data?.risk_report?.approved_probability || 0) * 100)}%</strong></span>
                  </div>
                </div>

                {/* Meter 2: Anomaly / Fraud Probability */}
                <div className="glass-panel rounded-2xl p-6 border border-brand-border/60 shadow-md flex flex-col items-center select-none relative overflow-hidden">
                  <div className="absolute top-2 right-3 font-semibold text-[10px] bg-brand-danger/10 text-brand-danger border border-brand-danger/30 px-2 py-0.5 rounded-md">
                    Isolation Forest
                  </div>
                  <h3 className="font-extrabold text-sm tracking-wide text-brand-muted self-start mb-6 uppercase">Fraud Indicator</h3>
                  
                  {/* Gauge representation */}
                  <div className="relative w-44 h-24 flex items-end justify-center mb-4">
                    <div className="absolute inset-0 rounded-t-full border-8 border-brand-border/50" />
                    <div 
                      className="absolute inset-0 rounded-t-full border-8 border-t-brand-danger border-r-brand-danger transition-all duration-1000 origin-bottom" 
                      style={{
                        borderColor: '#f43f5e',
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                        transform: `rotate(${Math.min(180, (fraudScore * 180) - 180)}deg)`
                      }}
                    />
                    
                    <div className="text-center z-10">
                      <p className="text-4xl font-extrabold text-brand-text -mb-1">{Math.round(fraudScore * 100)}%</p>
                      <p className={`text-xs font-bold ${
                        fraudLevel === 'Low' ? 'text-brand-success' :
                        fraudLevel === 'Medium' ? 'text-brand-warning' :
                        'text-brand-danger'
                      }`}>
                        {fraudLevel} Threat
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-brand-muted font-medium w-full text-center border-t border-brand-border/30 pt-3">
                    {data?.fraud_report?.anomalies && data.fraud_report.anomalies.length > 0 ? (
                      <span className="text-brand-danger font-semibold flex items-center justify-center gap-1">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        {data.fraud_report.anomalies.length} Suspicious Anomalies Detected
                      </span>
                    ) : (
                      <span className="text-brand-success font-semibold flex items-center justify-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Profile metadata trust score is clean
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Audit Logs Agent Stepper timeline */}
              <div className="glass-panel rounded-2xl p-6 border border-brand-border/60 shadow-md">
                <h3 className="font-extrabold text-lg text-brand-text mb-4 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-brand-secondary" />
                  AI Agent Multi-Agent Execution Log
                </h3>
                <p className="text-xs text-brand-muted mb-5 font-semibold">
                  Underwriting agents verify consents, collect profiles, score vectors, and verify compliance.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                  {[
                    { agent: 'Consent Agent', phase: 'Verify', active: !!data?.consent },
                    { agent: 'Data Agent', phase: 'Collect', active: !!data?.alternative_data_collected },
                    { agent: 'Feature Agent', phase: 'Engineer', active: !!data?.alternative_data_collected },
                    { agent: 'Fraud Agent', phase: 'Detect', active: !!data?.fraud_report },
                    { agent: 'Risk Agent', phase: 'Score', active: !!data?.risk_report },
                    { agent: 'Explain Agent', phase: 'Format', active: !!data?.explanation },
                    { agent: 'Compliance Agent', phase: 'Audit', active: !!data?.risk_report }
                  ].map((s, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                      s.active 
                        ? 'bg-brand-success/5 border-brand-success/30 text-brand-success shadow-sm' 
                        : 'bg-brand-card/30 border-brand-border/40 text-brand-muted'
                    }`}>
                      <CheckCircle className={`h-5 w-5 mb-1 ${s.active ? 'text-brand-success' : 'text-brand-border'}`} />
                      <span className="text-xs font-bold tracking-tight block">{s.agent}</span>
                      <span className="text-[10px] opacity-75 font-medium">{s.phase} Complete</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: SHAP explainability chart & Narrative */}
              <div className="glass-panel rounded-2xl p-6 border border-brand-border/60 shadow-md grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Visual Attributions */}
                <div>
                  <h4 className="font-extrabold text-md mb-4 flex items-center gap-1.5">
                    <BarChart2 className="h-5 w-5 text-brand-primary" />
                    SHAP Decision Influence Attributions
                  </h4>
                  {shapData.length > 0 ? (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={shapData}
                          layout="vertical"
                          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#23304a" />
                          <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                          <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={90} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#161f32', borderColor: '#23304a' }}
                            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                          />
                          <ReferenceLine x={0} stroke="#94a3b8" />
                          <Bar dataKey="influence" fill="#38bdf8" radius={[0, 4, 4, 0]}>
                            {
                              shapData.map((entry, index) => (
                                <line 
                                  key={`cell-${index}`} 
                                  fill={entry.influence >= 0 ? '#10b981' : '#f43f5e'} 
                                />
                              ))
                            }
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-xs text-brand-muted font-semibold bg-brand-bg/40 rounded-xl">
                      Waiting for SHAP model explanations...
                    </div>
                  )}
                </div>

                {/* Plain-English summary */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-md mb-4 flex items-center gap-1.5">
                      <FileText className="h-5 w-5 text-brand-secondary" />
                      Dynamic Underwriting Report
                    </h4>
                    <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-border/40 min-h-[140px]">
                      <p className="text-sm font-semibold mb-2 block">
                        Credit Decision: {' '}
                        <span className={data?.explanation?.decision === 'Approve' ? 'text-brand-success' : 'text-brand-danger'}>
                          {data?.explanation?.decision === 'Approve' ? 'Approved' : 'Rejected'}
                        </span>
                      </p>
                      <p className="text-xs text-brand-muted leading-relaxed font-semibold">
                        {data?.explanation?.narrative || 'Explainability engine is formulating the response...'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Fairness status badge */}
                  <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-brand-success/5 border border-brand-success/20 text-brand-success">
                    <span className="text-xs font-bold flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4" />
                      Compliance Audit Status
                    </span>
                    <span className="text-xs font-extrabold">Fairness Checked & Passed (0% sensitive bias)</span>
                  </div>
                </div>
              </div>

              {/* Row 4: Imported Alternative Data Profiles */}
              {data?.alternative_data_collected && (
                <div className="glass-panel rounded-2xl p-6 border border-brand-border/60 shadow-md">
                  <h3 className="font-extrabold text-lg text-brand-text mb-5 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-brand-secondary" />
                    Consented Alternative Data Snapshot Included
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* LinkedIn data */}
                    {data.alternative_data_collected.linkedin ? (
                      <div className="p-4 rounded-xl bg-brand-bg border border-brand-border/50">
                        <p className="text-xs font-bold text-brand-muted uppercase mb-3 flex items-center gap-1">
                          <Smartphone className="h-3.5 w-3.5 text-brand-primary" />
                          LinkedIn Verification
                        </p>
                        <p className="text-sm font-semibold">Tenure: <span className="text-brand-secondary">{data.alternative_data_collected.linkedin.experience} years</span></p>
                        <p className="text-sm font-semibold mt-1">Verified Co: <span className="text-brand-text">{data.alternative_data_collected.linkedin.company}</span></p>
                        <p className="text-sm font-semibold mt-1">Skills: <span className="text-brand-text">{data.alternative_data_collected.linkedin.skills} verified</span></p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-brand-bg/20 border border-dashed border-brand-border/40 flex items-center justify-center text-xs text-brand-muted">
                        LinkedIn Unconsented
                      </div>
                    )}
                    {/* University database */}
                    {data.alternative_data_collected.education ? (
                      <div className="p-4 rounded-xl bg-brand-bg border border-brand-border/50">
                        <p className="text-xs font-bold text-brand-muted uppercase mb-3 flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-brand-primary" />
                          Academic Registry
                        </p>
                        <p className="text-sm font-semibold">Degree: <span className="text-brand-text">{data.alternative_data_collected.education.degree}</span></p>
                        <p className="text-sm font-semibold mt-1">College: <span className="text-brand-secondary">{data.alternative_data_collected.education.college}</span></p>
                        <p className="text-sm font-semibold mt-1">Cumulative CGPA: <span className="text-brand-text">{data.alternative_data_collected.education.cgpa}/10</span></p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-brand-bg/20 border border-dashed border-brand-border/40 flex items-center justify-center text-xs text-brand-muted">
                        Education Database Unconsented
                      </div>
                    )}
                    {/* Device Trust */}
                    {data.alternative_data_collected.digital ? (
                      <div className="p-4 rounded-xl bg-brand-bg border border-brand-border/50">
                        <p className="text-xs font-bold text-brand-muted uppercase mb-3 flex items-center gap-1">
                          <Smartphone className="h-3.5 w-3.5 text-brand-primary" />
                          Device Signature
                        </p>
                        <p className="text-sm font-semibold">Device Age: <span className="text-brand-text">{data.alternative_data_collected.digital.device_age} days</span></p>
                        <p className="text-sm font-semibold mt-1">Verified Phone: <span className="text-brand-success">Yes</span></p>
                        <p className="text-sm font-semibold mt-1">Dispos. Email: <span className="text-brand-success">No</span></p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-brand-bg/20 border border-dashed border-brand-border/40 flex items-center justify-center text-xs text-brand-muted">
                        Telemetry Unconsented
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Row 5: Dynamic Behavior Simulator & Trend chart */}
              <div className="glass-panel rounded-2xl p-6 border border-brand-border/60 shadow-md grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Input Simulator Panel */}
                <div className="md:col-span-1 space-y-4">
                  <h4 className="font-extrabold text-md mb-2 flex items-center gap-1.5 text-brand-secondary">
                    <Play className="h-5 w-5" />
                    Dynamic Behaviour Simulator
                  </h4>
                  <p className="text-xs text-brand-muted leading-relaxed font-medium">
                    Run events (salary checks, repayment patterns, anomalies) to adjust the risk rating dynamically.
                  </p>
                  <div>
                    <label className="block text-xs text-brand-muted font-bold mb-1">Select Month</label>
                    <select 
                      className="w-full px-2 py-1.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-text font-semibold focus:outline-none"
                      value={simMonth} onChange={(e) => setSimMonth(e.target.value)}
                    >
                      <option value="1">Month 1</option>
                      <option value="2">Month 2</option>
                      <option value="3">Month 3</option>
                      <option value="4">Month 4</option>
                      <option value="5">Month 5</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-brand-muted font-bold mb-1">Repayment Status</label>
                    <select 
                      className="w-full px-2 py-1.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-text font-semibold focus:outline-none"
                      value={simRepayment} onChange={(e) => setSimRepayment(e.target.value)}
                    >
                      <option value="On-Time">On-Time Repayment</option>
                      <option value="Late">Late Repayment (-30 pts)</option>
                      <option value="Missed">Missed Repayment (-70 pts)</option>
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                      <input 
                        type="checkbox" checked={simSalary} 
                        onChange={(e) => setSimSalary(e.target.checked)} 
                        className="rounded border-brand-border accent-brand-primary"
                      />
                      Salary Received
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-brand-danger">
                      <input 
                        type="checkbox" checked={simAnomaly} 
                        onChange={(e) => setSimAnomaly(e.target.checked)} 
                        className="rounded border-brand-border accent-brand-danger"
                      />
                      Proxy Warning
                    </label>
                  </div>
                  <button
                    onClick={triggerSimulation} disabled={simulating}
                    className="w-full py-2 bg-brand-secondary hover:brightness-110 text-brand-bg font-extrabold rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${simulating ? 'animate-spin' : ''}`} />
                    {simulating ? 'Simulating...' : 'Inject Event Logs'}
                  </button>
                </div>

                {/* Score Trend display */}
                <div className="md:col-span-2">
                  <h4 className="font-extrabold text-md mb-4 flex items-center gap-1.5">
                    <BarChart2 className="h-5 w-5 text-brand-primary" />
                    Dynamic Score Repayment Adjustment Arc
                  </h4>
                  {data?.dynamic_history && data.dynamic_history.length > 0 ? (
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.dynamic_history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                          <YAxis domain={[300, 850]} stroke="#94a3b8" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: '#161f32', borderColor: '#23304a' }} />
                          <CartesianGrid strokeDasharray="3 3" stroke="#23304a" />
                          <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#38bdf8', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-xs text-brand-muted font-semibold bg-brand-bg/40 rounded-xl">
                      Waiting for application approval to plot dynamic repayment paths...
                    </div>
                  )}
                </div>
              </div>

              {/* Row 6: Audit log lists */}
              <div className="glass-panel rounded-2xl p-6 border border-brand-border/60 shadow-md">
                <h3 className="font-extrabold text-lg text-brand-text mb-4">Underwriting Ledger Compliance Logs</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {data?.audit_logs && data.audit_logs.length > 0 ? (
                    data.audit_logs.map((log) => (
                      <div key={log.id} className="p-3 bg-brand-bg border border-brand-border/50 rounded-xl flex gap-3 items-start">
                        <div className={`mt-0.5 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          log.status === 'Success' ? 'bg-brand-success/10 text-brand-success border border-brand-success/20' :
                          'bg-brand-warning/10 text-brand-warning border border-brand-warning/20'
                        }`}>
                          {log.status}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-brand-text">{log.agent_name} : <span className="font-normal text-brand-muted">{log.log_message}</span></p>
                          <p className="text-[10px] text-brand-muted mt-1 font-semibold">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-brand-muted text-center py-6 font-semibold">Ledger is empty.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
