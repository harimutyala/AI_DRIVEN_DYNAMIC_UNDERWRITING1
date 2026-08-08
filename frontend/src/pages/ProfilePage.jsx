import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, Mail, Calendar, Key, CheckSquare } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'User';
  const email = localStorage.getItem('email') || 'user@dynamic.com';
  const role = localStorage.getItem('role') || 'customer';

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        <div className="flex items-center gap-4 border-b border-[#23304a] pb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-extrabold text-2xl flex items-center justify-center">
            {name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{name}</h1>
            <p className="text-xs text-slate-400">{email}</p>
            <span className={`inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
              role === 'admin' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              Role: {role}
            </span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#161f32]/80 border border-[#23304a] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#23304a] pb-3">
            <User className="w-4 h-4 text-indigo-400" /> Account Security & Settings
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b0f19]/60 border border-[#23304a]">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Email Address</span>
                  <span className="text-[11px] text-slate-400 block">{email}</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Verified</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b0f19]/60 border border-[#23304a]">
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Authentication Token</span>
                  <span className="text-[11px] text-slate-400 block">JWT Bearer Token Active</span>
                </div>
              </div>
              <span className="text-[10px] text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded">Active Session</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
