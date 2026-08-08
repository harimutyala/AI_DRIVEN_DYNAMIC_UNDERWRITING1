import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, Users, FileText, CheckCircle2, XCircle, Clock, 
  Search, ShieldAlert, BarChart2, Filter, RefreshCw, Eye, Check, X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import FairnessAuditCard from '../components/FairnessAuditCard';
import { formatErrorMessage } from '../utils/errorUtils';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const res = await axios.get('http://127.0.0.1:8000/api/dashboard');
      if (res.data.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load Admin Dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOverrideStatus = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await axios.put(`http://127.0.0.1:8000/api/loan/${appId}/status`, {
        status: newStatus
      });
      fetchData();
    } catch (err) {
      alert(formatErrorMessage(err, 'Status update failed'));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
        <Navbar />
        <div className="p-12 text-center text-slate-400">Loading Administrator Underwriting Portal...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            {error || 'Admin access required.'}
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            Login as Administrator
          </button>
        </div>
      </div>
    );
  }

  const { stats, recent_applications = [], fairness_audit } = data;

  // Filter applications
  const filteredApps = recent_applications.filter(app => {
    const matchesSearch = 
      app.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.application_id.toString().includes(searchQuery);

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#23304a] pb-6">
          <div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Module 13 & 15</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Building2 className="w-8 h-8 text-indigo-400" />
              Underwriting Executive Dashboard
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Real-time loan application metrics, manual decision overrides, and regulatory fairness auditing.
            </p>
          </div>

          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-[#161f32] border border-[#23304a] text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Stats
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-[#161f32]/80 border border-[#23304a]">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Applications</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{stats.total_applications}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#161f32]/80 border border-emerald-500/20">
            <span className="text-[10px] font-bold text-emerald-400 uppercase block">Approved</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">{stats.approved_count}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#161f32]/80 border border-rose-500/20">
            <span className="text-[10px] font-bold text-rose-400 uppercase block">Rejected</span>
            <span className="text-2xl font-extrabold text-rose-400 mt-1 block">{stats.rejected_count}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#161f32]/80 border border-amber-500/20">
            <span className="text-[10px] font-bold text-amber-400 uppercase block">Pending</span>
            <span className="text-2xl font-extrabold text-amber-400 mt-1 block">{stats.pending_count}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#161f32]/80 border border-[#23304a]">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Loan Amount</span>
            <span className="text-xl font-extrabold text-indigo-300 mt-1 block">${Math.round(stats.average_loan_amount).toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#161f32]/80 border border-[#23304a]">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Dynamic Score</span>
            <span className="text-xl font-extrabold text-sky-400 mt-1 block">{Math.round(stats.average_risk_score)}</span>
          </div>
        </div>

        {/* Applications Table Section */}
        <div className="p-6 rounded-2xl bg-[#161f32]/80 border border-[#23304a] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23304a] pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Underwriting Applications Directory
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search applicant or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0b0f19] border border-[#23304a] focus:border-indigo-500 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Filter dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0b0f19] border border-[#23304a] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b0f19]/70 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Applicant</th>
                  <th className="p-3">Loan Amount</th>
                  <th className="p-3">Salary</th>
                  <th className="p-3">Bureau / Dynamic Score</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Fraud Level</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23304a]/60">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-6 text-center text-slate-500">
                      No applications matched search filters.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.application_id} className="hover:bg-[#0b0f19]/40 transition-colors">
                      <td className="p-3 font-bold text-white">#{app.application_id}</td>
                      <td className="p-3">
                        <span className="font-semibold text-white block">{app.user_name}</span>
                        <span className="text-[10px] text-slate-400 block">{app.email}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-200">${app.loan_amount?.toLocaleString()}</td>
                      <td className="p-3 text-slate-300">${app.salary?.toLocaleString()}</td>
                      <td className="p-3">
                        <span className="font-bold text-sky-400">{app.dynamic_score}</span>
                        <span className="text-[10px] text-slate-500 block">Bureau: {app.credit_score}</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          app.risk_category === 'Low Risk' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          app.risk_category === 'Medium Risk' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {app.risk_category}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          app.fraud_level === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {app.fraud_level} Fraud Risk
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/loan/report/${app.application_id}`}
                            className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 transition-colors"
                            title="View Risk & SHAP Report"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Quick Overrides */}
                          <button
                            onClick={() => handleOverrideStatus(app.application_id, 'Approved')}
                            disabled={updatingId === app.application_id}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                            title="Approve Loan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOverrideStatus(app.application_id, 'Rejected')}
                            disabled={updatingId === app.application_id}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors disabled:opacity-50"
                            title="Reject Loan"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regulatory Fairness Audit Report */}
        <FairnessAuditCard auditData={fairness_audit} />

      </main>
    </div>
  );
}
