import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Activity, Building2 } from 'lucide-react';
import { formatErrorMessage } from '../utils/errorUtils';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Register User Account
      await axios.post('http://127.0.0.1:8000/api/auth/register', {
        name,
        email,
        password,
        role
      });

      // 2. Auto-login immediately for seamless user onboarding
      const loginRes = await axios.post('http://127.0.0.1:8000/api/auth/login', {
        email,
        password,
      });

      const { access_token, role: userRole, name: userName, email: userEmail } = loginRes.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('name', userName);
      localStorage.setItem('email', userEmail);

      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // 3. Redirect to dashboard
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(formatErrorMessage(err, 'Registration failed. Choose a different email address or longer password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 relative overflow-hidden font-sans text-white">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-brand-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-brand-secondary/10 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md glass-panel rounded-2xl border border-brand-border/60 p-8 shadow-premium relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/30 mb-3 shadow-glow glow-active">
            <Activity className="h-8 w-8 text-brand-secondary" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            DynamicRisk AI
          </h1>
          <p className="text-xs text-brand-muted mt-1 font-medium text-center">
            AI-Driven Dynamic Credit Risk & Fraud Intelligence
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/20 text-xs text-brand-danger text-center font-medium leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-muted">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                autoComplete="off"
                spellCheck={false}
                className="w-full pl-9 pr-4 py-2.5 bg-brand-bg/50 border border-brand-border rounded-xl text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary transition-all"
                placeholder="MUTYALA HARI"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">
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
                className="w-full pl-9 pr-4 py-2.5 bg-brand-bg/50 border border-brand-border rounded-xl text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary transition-all"
                placeholder="harimutyala2004@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">
              Password (min 6 characters)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-muted">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                spellCheck={false}
                className="w-full pl-9 pr-4 py-2.5 bg-brand-bg/50 border border-brand-border rounded-xl text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'customer'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-brand-bg/40 border-brand-border text-slate-400'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'admin'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                    : 'bg-brand-bg/40 border-brand-border text-slate-400'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Underwriter Admin
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-110 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all shadow-md"
          >
            {loading ? 'Creating Account & Signing In...' : 'Register Profile & Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-brand-muted">
          Already registered?{' '}
          <Link to="/login" className="text-brand-secondary hover:underline cursor-pointer">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
