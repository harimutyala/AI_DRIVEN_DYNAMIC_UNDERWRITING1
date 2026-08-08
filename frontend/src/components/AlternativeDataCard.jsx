import React from 'react';
import { Linkedin, GraduationCap, Briefcase, Smartphone, CheckCircle, Lock } from 'lucide-react';

export default function AlternativeDataCard({ alternativeData, consent }) {
  if (!alternativeData) {
    return (
      <div className="p-5 rounded-2xl bg-[#161f32]/80 border border-[#23304a] text-center py-8">
        <Lock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-300">Alternative Data Not Extracted</h4>
        <p className="text-xs text-slate-400 mt-1 mb-3 max-w-xs mx-auto">
          Grant explicit consents on the Consent Portal to allow alternative data ingestion for improved underwriting scores.
        </p>
      </div>
    );
  }

  const { linkedin, employment, education, digital } = alternativeData;

  return (
    <div className="p-5 rounded-2xl bg-[#161f32]/80 border border-[#23304a] space-y-4">
      <div className="flex items-center justify-between border-b border-[#23304a] pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-sky-400" />
          Consented Alternative Datasets
        </h3>
        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          Verified Signals
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* LinkedIn Card */}
        {linkedin && (
          <div className="p-3 bg-[#0b0f19]/70 rounded-xl border border-[#23304a]/70 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Linkedin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">{linkedin.name || 'Rahul'}</span>
                {linkedin.profile_verified && (
                  <CheckCircle className="w-3.5 h-3.5 text-sky-400" title="Verified Profile" />
                )}
              </div>
              <p className="text-[11px] text-slate-300">{linkedin.company} • {linkedin.experience} Yrs Exp</p>
              <span className="text-[10px] text-indigo-400 font-semibold">{linkedin.skills} Endorsed Skills</span>
            </div>
          </div>
        )}

        {/* Education Card */}
        {education && (
          <div className="p-3 bg-[#0b0f19]/70 rounded-xl border border-[#23304a]/70 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white">{education.degree}</span>
              <p className="text-[11px] text-slate-300">{education.college}</p>
              <span className="text-[10px] text-emerald-400 font-semibold">CGPA: {education.cgpa} / 10.0</span>
            </div>
          </div>
        )}

        {/* Employment Card */}
        {employment && (
          <div className="p-3 bg-[#0b0f19]/70 rounded-xl border border-[#23304a]/70 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white">{employment.company}</span>
              <p className="text-[11px] text-slate-300">Verified Income: ${employment.salary?.toLocaleString()}/yr</p>
              <span className="text-[10px] text-slate-400">{employment.years} Years Job Stability</span>
            </div>
          </div>
        )}

        {/* Digital Behavior Card */}
        {digital && (
          <div className="p-3 bg-[#0b0f19]/70 rounded-xl border border-[#23304a]/70 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white">Digital Footprint</span>
              <p className="text-[11px] text-slate-300">UPI Usage: {digital.upi_usage} • Email: {digital.email_age} Yrs</p>
              <span className="text-[10px] text-sky-400 font-semibold">Device Age: {digital.device_age} days</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
