import React, { useState } from 'react';
import axios from 'axios';
import api from '../utils/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';
import { formatErrorMessage } from '../utils/errorUtils';

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.registered ? 'Account created successfully! Please sign in below.' : '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const performLogin = async (loginEmail, loginPassword) => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', {
        email: loginEmail.trim(),
        password: loginPassword.trim(),
      });
      
      const { access_token, role, name, email: userEmail } = res.data;
      
      // Store in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);
      localStorage.setItem('email', userEmail);
      
      // Set api & default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(formatErrorMessage(err, 'Invalid email or password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const loadDemoAccount = (type) => {
    if (type === 'customer') {
      setEmail('rahul@dynamic.com');
      setPassword('rahul123');
      performLogin('rahul@dynamic.com', 'rahul123');
    } else if (type === 'admin') {
      setEmail('admin@dynamic.com');
      setPassword('admin123');
      performLogin('admin@dynamic.com', 'admin123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 relative overflow-hidden text-white font-sans">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-brand-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-brand-secondary/10 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md glass-panel rounded-2xl border border-brand-border/60 p-8 shadow-premium relative z-10 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/30 mb-3 shadow-glow glow-active">
            <Activity className="h-8 w-8 text-brand-secondary" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide font-sans">
            DynamicRisk AI
          </h1>
          <p className="text-xs text-brand-muted mt-1 font-medium text-center">
            AI-Driven Dynamic Credit Risk & Fraud Intelligence
          </p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 text-center font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/20 text-xs text-brand-danger text-center font-medium leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-muted">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                autoComplete="off"
                spellCheck={false}
                className="w-full pl-9 pr-4 py-2.5 bg-brand-bg/50 border border-brand-border rounded-xl text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary transition-all font-sans font-medium"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-muted">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                autoComplete="new-password"
                spellCheck={false}
                className="w-full pl-9 pr-4 py-2.5 bg-brand-bg/50 border border-brand-border rounded-xl text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary transition-all font-sans font-medium"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-110 text-white rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all shadow-md cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-brand-muted">
          New applicant?{' '}
          <Link to="/register" className="text-brand-secondary hover:underline cursor-pointer">
            Create Account
          </Link>
        </p>

        {/* Demo Fast-login Buttons */}
        <div className="mt-6 border-t border-brand-border/40 pt-5">
          <p className="text-[10px] text-center text-brand-muted font-bold tracking-wider uppercase mb-3">
            Hackathon Demo Quick Login
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => loadDemoAccount('customer')}
              className="flex-1 py-2 bg-brand-card border border-brand-border hover:border-brand-secondary/40 text-brand-text text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              📊 Customer (Rahul)
            </button>
            <button
              type="button"
              onClick={() => loadDemoAccount('admin')}
              className="flex-1 py-2 bg-brand-card border border-brand-border hover:border-brand-primary/40 text-brand-text text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              🛡️ Underwriter Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
