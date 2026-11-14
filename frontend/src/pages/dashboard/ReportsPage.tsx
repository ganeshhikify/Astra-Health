import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  CheckCircle2
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const reportsList = [
    {
      id: 'REP-42-B',
      title: 'Weekly Bio-Telemetry Synthesis & Physiological Assessment',
      cycle: 'Cycle 42 (Sol 36 – Sol 42)',
      date: '2027-04-20',
      type: 'Flight Surgeon Review',
      status: 'Signed & Certified',
      summary:
        'Comprehensive analysis of cardiovascular adaptation, bone mineral density loading rate, and cognitive vigilance. Astronaut certified ready for scheduled Lunar EVA Operations.',
      physician: 'Dr. Gregory Vance, MD (Flight Surgeon, NASA JSC)'
    },
    {
      id: 'REP-41-A',
      title: 'Neuro-Vestibular & Space Adaptation Syndrome Clearance',
      cycle: 'Cycle 41 (Sol 29 – Sol 35)',
      date: '2027-04-13',
      type: 'Sensory Assessment',
      status: 'Certified Baseline',
      summary:
        'Post-insertion acute sensory conflict completely subsided. Vestibular-ocular reflex and fine motor coordination return to ground baselines.',
      physician: 'Dr. Elena Rostova, MD (Bio-Astronautics Medical Team)'
    },
    {
      id: 'REP-40-C',
      title: 'ARED Loading Adherence & Musculoskeletal Bone Density Audit',
      cycle: 'Cycle 40 (Sol 22 – Sol 28)',
      date: '2027-04-06',
      type: 'Countermeasure Audit',
      status: 'Compliant',
      summary:
        'Resistive exercise compliance rated 100%. Caloric intake matched energy expenditure within 4.2% margin. Calcium homeostasis stable.',
      physician: 'Dr. Marcus Webb, PhD (Exercise Countermeasures Lead)'
    },
    {
      id: 'REP-39-F',
      title: 'Pre-Flight Comprehensive Clinical Baseline Record',
      cycle: 'Mission Baseline (T-0)',
      date: '2027-03-30',
      type: 'Launch Clearance',
      status: 'Archived Reference',
      summary:
        'Pre-launch clinical certification including 12-lead ECG, stress echocardiogram, dual-energy X-ray absorptiometry (DEXA), and genomic baseline.',
      physician: 'NASA Flight Medicine Board (Kennedy Space Center)'
    }
  ];

  const handleDownload = (repId: string) => {
    setDownloadToast(`Report ${repId} exported successfully to local archive.`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Toast */}
      {downloadToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-[#111111] border border-cyan-400/50 text-cyan-300 shadow-2xl text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#111111] border border-[#252525]">
        <div>
          <div className="flex items-center gap-2 text-xs font-orbitron tracking-widest text-[#36C9E8] uppercase mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>CLINICAL TELEMETRY ARCHIVE</span>
          </div>
          <h1 className="font-orbitron text-xl sm:text-2xl font-bold text-white tracking-wide">
            HEALTH REPORTS &amp; AUDITS
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            Certified flight surgeon health summaries, clinical telemetry audits, and mission medical logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDownload('ALL-CURRENT')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#36C9E8] hover:bg-cyan-400 text-black font-space font-semibold text-xs tracking-wider uppercase transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export All Reports</span>
          </button>
        </div>
      </div>

      {/* Reports Archive List */}
      <div className="space-y-4">
        {reportsList.map(rep => (
          <div
            key={rep.id}
            className="p-6 rounded-xl bg-[#111111] border border-[#252525] hover:border-[#36C9E8]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-[#161616] text-[#36C9E8] border border-[#252525]">
                  {rep.id}
                </span>
                <span className="text-[#A3A3A3]">{rep.cycle}</span>
                <span className="text-[#525252]">•</span>
                <span className="text-slate-400">{rep.date}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {rep.status}
                </span>
              </div>

              <h3 className="font-orbitron font-bold text-base text-white">
                {rep.title}
              </h3>

              <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-3xl">
                {rep.summary}
              </p>

              <div className="text-[11px] text-[#737373] pt-1">
                Authorized By: <span className="text-slate-300 font-medium">{rep.physician}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
              <button
                onClick={() => handleDownload(rep.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] border border-[#252525] text-xs text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#36C9E8]" />
                <span>PDF Document</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

