import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  ArrowRight,
  Brain,
  ShieldCheck,
  Send,
  RefreshCw,
  Info,
  User,
  Moon,
  Dumbbell
} from 'lucide-react';

interface HealthAssessmentPageProps {
  onBackToDashboard: () => void;
}

export const HealthAssessmentPage: React.FC<HealthAssessmentPageProps> = ({
  onBackToDashboard
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State across all workflow steps
  const [formData, setFormData] = useState({
    // Step 1: Personal Information & Mission Profile
    astronautName: 'Cmdr. Sarah Vance',
    crewId: 'AST-7824',
    astronautRole: 'Mission Commander / Astrobiologist',
    missionDay: 'Sol 42',
    habitatZone: 'Habitat Core 1 (Lunar South Pole)',

    // Step 2: Vital Signs Triage
    heartRate: '72',
    bloodOxygen: '98',
    temperature: '36.8',
    bpSystolic: '120',
    bpDiastolic: '80',
    headache: false,
    congestion: false,
    fatigue: false,
    backDiscomfort: false,

    // Step 3: Sleep Assessment & Physical Activity
    sleepHours: '7.4',
    sleepQuality: 'Restful',
    sleepLatency: '12',
    aredDuration: '75',
    aerobicDuration: '45',

    // Step 4: Mental Wellness & Space Adaptation
    smsSeverity: 'None',
    vestibularRating: '1',
    sansVisionShift: 'No',
    cognitiveAlertness: '9',
    workloadStress: 'Low',
    astronautNotes: 'Circadian entrainment nominal. No motion disorientation noted during rotational habitat spin-up.'
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setToastMessage('Assessment successfully synchronized with Mission Control (Simulated Telemetry Uplink).');
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleReset = () => {
    setSubmitted(false);
    setCurrentStep(1);
  };

  const stepsList = [
    { num: 1, label: 'Personal Information' },
    { num: 2, label: 'Vital Signs' },
    { num: 3, label: 'Sleep & Physical Activity' },
    { num: 4, label: 'Mental Wellness & SAS' },
    { num: 5, label: 'Summary & Review' }
  ];

  return (
    <div
      style={{ fontFamily: "'Manrope', sans-serif" }}
      className="min-h-screen bg-[#050505] text-white p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-[#111111] border border-[#36C9E8]/60 text-cyan-300 shadow-2xl text-sm font-semibold"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <CheckCircle2 className="w-5 h-5 text-[#36C9E8] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#111111] border border-[#252525]"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#161616] border border-[#252525] flex items-center justify-center text-[#36C9E8]">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#36C9E8]/10 text-[#36C9E8] border border-[#36C9E8]/30">
                MODULE 02
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
                MANROPE TYPOGRAPHY
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                SIMULATED DATA
              </span>
            </div>
            <h1
              className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1"
              style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
            >
              Astronaut Health Self-Assessment
            </h1>
            <p
              className="text-xs sm:text-sm text-[#A3A3A3] mt-0.5 font-normal"
              style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
            >
              Comprehensive flight readiness assessment protocol for deep-space mission crew.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#161616] hover:bg-[#202020] text-slate-200 border border-[#252525] hover:border-[#36C9E8]/40 transition-colors self-start sm:self-auto cursor-pointer"
          style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
        >
          <ArrowLeft className="w-4 h-4 text-[#36C9E8]" />
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Simulated Telemetry Banner */}
      <div
        className="p-3.5 rounded-xl bg-[#111111] border border-[#252525] flex items-center gap-3 text-xs text-[#A3A3A3]"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <Info className="w-4 h-4 text-[#36C9E8] shrink-0" />
        <p className="leading-snug font-normal" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}>
          <strong className="text-white font-semibold">Simulated Clinical Workflow:</strong> All questions, inputs, and summaries in this assessment are demonstration simulation metrics for spaceflight mission operations.
        </p>
      </div>

      {/* Progress Indicators / Stepper */}
      <div
        className="p-5 rounded-2xl bg-[#111111] border border-[#252525]"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stepsList.map(step => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num || submitted;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => !submitted && setCurrentStep(step.num)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#161616] border-[#36C9E8] text-white shadow-md'
                    : isCompleted
                    ? 'bg-[#141414] border-emerald-500/40 text-emerald-300'
                    : 'bg-[#0E0E0E] border-[#202020] text-[#737373] hover:text-[#A3A3A3]'
                }`}
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold ${
                    isActive
                      ? 'bg-[#36C9E8] text-black font-bold'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                      : 'bg-[#1A1A1A] text-[#737373]'
                  }`}
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                >
                  {isCompleted && !isActive ? '✓' : `0${step.num}`}
                </div>
                <div
                  className="text-xs font-semibold leading-tight truncate"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                >
                  {step.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content / Inner Workflow Pages */}
      {!submitted ? (
        <form
          onSubmit={currentStep === 5 ? handleSubmitAssessment : handleNextStep}
          className="space-y-6"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {/* STEP 1: Personal Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#252525] space-y-6"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              <div className="border-b border-[#252525] pb-4">
                <div
                  className="text-xs font-semibold text-[#36C9E8] uppercase tracking-wider"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                >
                  Step 01 of 05 • Profile Confirmation
                </div>
                <h2
                  className="text-xl font-bold text-white mt-1"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                >
                  Astronaut Personal Information &amp; Flight Profile
                </h2>
                <p
                  className="text-xs sm:text-sm text-[#A3A3A3] mt-1 font-normal"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                >
                  Confirm flight identity and operational habitat sector prior to clinical telemetry logging.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#161616] border border-[#252525] space-y-2">
                  <label
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-300"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    <User className="w-3.5 h-3.5 text-[#36C9E8]" />
                    <span>Astronaut Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={formData.astronautName}
                    onChange={e => handleInputChange('astronautName', e.target.value)}
                    required
                    placeholder="Enter astronaut full name"
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] focus:border-[#36C9E8] text-white text-sm font-normal outline-none"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                  />
                  <div
                    className="text-[10px] text-[#A3A3A3] font-normal"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                  >
                    Primary crew manifest designation
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161616] border border-[#252525] space-y-2">
                  <label
                    className="block text-xs font-semibold text-slate-300"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    Crew ID Code
                  </label>
                  <input
                    type="text"
                    value={formData.crewId}
                    onChange={e => handleInputChange('crewId', e.target.value)}
                    required
                    placeholder="e.g. AST-7824"
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] focus:border-[#36C9E8] text-white text-sm font-normal outline-none"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                  />
                  <div
                    className="text-[10px] text-[#A3A3A3] font-normal"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                  >
                    NASA telemetry biometric identifier
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161616] border border-[#252525] space-y-2">
                  <label
                    className="block text-xs font-semibold text-slate-300"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    Astronaut Mission Role
                  </label>
                  <input
                    type="text"
                    value={formData.astronautRole}
                    onChange={e => handleInputChange('astronautRole', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] focus:border-[#36C9E8] text-white text-sm font-normal outline-none"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                  />
                  <div
                    className="text-[10px] text-[#A3A3A3] font-normal"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                  >
                    Assigned operational workload designation
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161616] border border-[#252525] space-y-2">
                  <label
                    className="block text-xs font-semibold text-slate-300"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    Mission Timeline / Habitat Sector
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.missionDay}
                      onChange={e => handleInputChange('missionDay', e.target.value)}
                      className="w-1/3 px-3 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] text-white text-sm font-normal outline-none"
                      style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                    />
                    <input
                      type="text"
                      value={formData.habitatZone}
                      onChange={e => handleInputChange('habitatZone', e.target.value)}
                      className="w-2/3 px-3 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] text-white text-sm font-normal outline-none"
                      style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                    />
                  </div>
                  <div
                    className="text-[10px] text-[#A3A3A3] font-normal"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                  >
                    Environmental pressure: 14.7 psia nominal
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Vital Signs */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#252525] space-y-6"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              <div className="border-b border-[#252525] pb-4">
                <div
                  className="text-xs font-semibold text-[#36C9E8] uppercase tracking-wider"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                >
                  Step 02 of 05 • Vitals Calibration
                </div>
                <h2
                  className="text-xl font-bold text-white mt-1"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                >
                  Continuous Vital Signs Triage
                </h2>
                <p
                  className="text-xs sm:text-sm text-[#A3A3A3] mt-1 font-normal"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                >
                  Verify cardiovascular and metabolic sensor telemetry or log manually confirmed metrics.
                </p>
              </div>

              {/* Vitals Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Heart Rate */}
                <div className="p-4 rounded-xl bg-[#161616] border border-[#252525] space-y-2">
                  <label
                    className="flex items-center justify-between text-xs font-semibold text-slate-300"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>Heart Rate</span>
                    </span>
                    <span className="text-[10px] text-[#A3A3A3] font-normal">BPM</span>
                  </label>
                  <input
                    type="number"
                    value={formData.heartRate}
                    onChange={e => handleInputChange('heartRate', e.target.value)}
                    required
                    placeholder="72"
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] focus:border-[#36C9E8] text-white text-base font-bold outline-none"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                  />
                  <div className="text-[10px] text-[#A3A3A3] font-normal">Normal: 60 - 100 BPM</div>
                </div>

                {/* Blood Oxygen */}
                <div className="p-4 rounded-xl bg-[#161616] border border-[#252525] space-y-2">
                  <label
                    className="flex items-center justify-between text-xs font-semibold text-slate-300"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Blood Oxygen (SpO2)</span>
                    </span>
                    <span className="text-[10px] text-[#A3A3A3] font-normal">%</span>
                  </label>
                  <input
                    type="number"
                    value={formData.bloodOxygen}
                    onChange={e => handleInputChange('bloodOxygen', e.target.value)}
                    required
                    placeholder="98"
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] focus:border-[#36C9E8] text-white text-base font-bold outline-none"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                  />
                  <div className="text-[10px] text-[#A3A3A3] font-normal">Optimal: &gt; 95%</div>
                </div>

                {/* Temperature */}
                <div className="p-4 rounded-xl bg-[#161616] border border-[#252525] space-y-2">
                  <label
                    className="flex items-center justify-between text-xs font-semibold text-slate-300"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Body Temperature</span>
                    </span>
                    <span className="text-[10px] text-[#A3A3A3] font-normal">°C</span>
                  </label>
                  <input
                    type="text"
                    value={formData.temperature}
                    onChange={e => handleInputChange('temperature', e.target.value)}
                    required
                    placeholder="36.8"
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] focus:border-[#36C9E8] text-white text-base font-bold outline-none"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                  />
                  <div className="text-[10px] text-[#A3A3A3] font-normal">Baseline: 36.5 - 37.2 °C</div>
                </div>

                {/* Blood Pressure */}
                <div className="p-4 rounded-xl bg-[#161616] border border-[#252525] space-y-2">
                  <label
                    className="flex items-center justify-between text-xs font-semibold text-slate-300"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Blood Pressure</span>
                    </span>
                    <span className="text-[10px] text-[#A3A3A3] font-normal">mmHg</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.bpSystolic}
                      onChange={e => handleInputChange('bpSystolic', e.target.value)}
                      required
                      placeholder="120"
                      className="w-1/2 px-2.5 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] focus:border-[#36C9E8] text-white text-sm font-bold outline-none text-center"
                      style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                    />
                    <span className="text-slate-500 font-bold">/</span>
                    <input
                      type="number"
                      value={formData.bpDiastolic}
                      onChange={e => handleInputChange('bpDiastolic', e.target.value)}
                      required
                      placeholder="80"
                      className="w-1/2 px-2.5 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] focus:border-[#36C9E8] text-white text-sm font-bold outline-none text-center"
                      style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                    />
                  </div>
                  <div className="text-[10px] text-[#A3A3A3] font-normal">Nominal: 120/80 mmHg</div>
                </div>
              </div>

              {/* Acute Symptoms Checkbox Panel */}
              <div className="space-y-3 pt-2">
                <label
                  className="block text-xs font-semibold text-white uppercase tracking-wider"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                >
                  Acute Microgravity Symptoms (Select any experienced in past 12 hrs)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'headache', label: 'Cephalic Head Pressure / Fullness', desc: 'Fluid headward redistribution' },
                    { key: 'congestion', label: 'Sinus Congestion', desc: 'Microgravity nasal mucosal swelling' },
                    { key: 'fatigue', label: 'General Muscular Fatigue', desc: 'Post-EVA / ARED workout soreness' },
                    { key: 'backDiscomfort', label: 'Lumbar Spinal Lengthening Discomfort', desc: 'Intervertebral disk decompress' }
                  ].map(symptom => (
                    <label
                      key={symptom.key}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                        (formData as any)[symptom.key]
                          ? 'bg-[#161616] border-[#36C9E8]/60 text-white'
                          : 'bg-[#141414] border-[#252525] text-slate-300 hover:border-[#36C9E8]/30'
                      }`}
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                      <input
                        type="checkbox"
                        checked={(formData as any)[symptom.key]}
                        onChange={e => handleInputChange(symptom.key, e.target.checked)}
                        className="mt-1 w-4 h-4 rounded accent-[#36C9E8] cursor-pointer"
                      />
                      <div>
                        <div
                          className="text-xs font-semibold text-white"
                          style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                        >
                          {symptom.label}
                        </div>
                        <div
                          className="text-[11px] text-[#A3A3A3] mt-0.5 font-normal"
                          style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                        >
                          {symptom.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Sleep Assessment & Physical Activity */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#252525] space-y-6"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              <div className="border-b border-[#252525] pb-4">
                <div
                  className="text-xs font-semibold text-[#36C9E8] uppercase tracking-wider"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                >
                  Step 03 of 05 • Sleep &amp; Countermeasures
                </div>
                <h2
                  className="text-xl font-bold text-white mt-1"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                >
                  Sleep Assessment &amp; Physical Activity Loading
                </h2>
                <p
                  className="text-xs sm:text-sm text-[#A3A3A3] mt-1 font-normal"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                >
                  Tracking polysomnography restorative sleep, sleep latency, and ARED countermeasure compliance.
                </p>
              </div>

              {/* Sleep Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#161616] border border-[#252525] space-y-2">
                  <label
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-300"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    <Moon className="w-3.5 h-3.5 text-[#36C9E8]" />
                    <span>Sleep Duration (Hours)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.sleepHours}
                    onChange={e => handleInputChange('sleepHours', e.target.value)}
                    required
                    placeholder="7.4"
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] focus:border-[#36C9E8] text-white text-base font-bold outline-none"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                  />
                  <div className="text-[10px] text-[#A3A3A3] font-normal">Target: 8.0 hrs nightly</div>
                </div>

                <div className="p-4 rounded-xl bg-[#161616] border border-[#252525] space-y-2">
                  <label
                    className="block text-xs font-semibold text-slate-300"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    Subjective Sleep Quality
                  </label>
                  <select
                    value={formData.sleepQuality}
                    onChange={e => handleInputChange('sleepQuality', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] focus:border-[#36C9E8] text-white text-sm font-semibold outline-none cursor-pointer"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    <option value="Restful">Restful (Stage 3 Deep Reached)</option>
                    <option value="Moderate">Moderate (Minor Microgravity Awakenings)</option>
                    <option value="Fragmented">Fragmented (Disrupted by Habitat Sounds)</option>
                    <option value="Poor">Poor (High Latency &gt; 45 min)</option>
                  </select>
                  <div className="text-[10px] text-[#A3A3A3] font-normal">Polysomnography EEG baseline</div>
                </div>

                <div className="p-4 rounded-xl bg-[#161616] border border-[#252525] space-y-2">
                  <label
                    className="block text-xs font-semibold text-slate-300"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    Sleep Latency (Minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.sleepLatency}
                    onChange={e => handleInputChange('sleepLatency', e.target.value)}
                    required
                    placeholder="12"
                    className="w-full px-3 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] focus:border-[#36C9E8] text-white text-base font-bold outline-none"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                  />
                  <div className="text-[10px] text-emerald-400 font-normal">Nominal latency: &lt; 20 min</div>
                </div>
              </div>

              {/* Exercise Countermeasures */}
              <div className="p-5 rounded-xl bg-[#161616] border border-[#252525] space-y-4">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-emerald-400" />
                  <h3
                    className="text-sm font-semibold text-white"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    Prescribed Exercise Countermeasures
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      className="text-xs font-semibold text-slate-300 block"
                      style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                    >
                      ARED Resistive Exercise (Completed Minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.aredDuration}
                      onChange={e => handleInputChange('aredDuration', e.target.value)}
                      required
                      placeholder="75"
                      className="w-full px-3 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] text-white text-sm font-semibold outline-none"
                      style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                    />
                    <div className="text-[10px] text-[#A3A3A3] font-normal">Prescription: 75 min squat / deadlift loading</div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className="text-xs font-semibold text-slate-300 block"
                      style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                    >
                      T2 Aerobic Treadmill (Completed Minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.aerobicDuration}
                      onChange={e => handleInputChange('aerobicDuration', e.target.value)}
                      required
                      placeholder="45"
                      className="w-full px-3 py-2 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] text-white text-sm font-semibold outline-none"
                      style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                    />
                    <div className="text-[10px] text-[#A3A3A3] font-normal">Prescription: 45 min cardiovascular loading</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Mental Wellness & Neuro-Vestibular */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#252525] space-y-6"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              <div className="border-b border-[#252525] pb-4">
                <div
                  className="text-xs font-semibold text-[#36C9E8] uppercase tracking-wider"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                >
                  Step 04 of 05 • Sensory &amp; Psychology
                </div>
                <h2
                  className="text-xl font-bold text-white mt-1"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                >
                  Mental Wellness &amp; Space Adaptation Syndrome (SAS)
                </h2>
                <p
                  className="text-xs sm:text-sm text-[#A3A3A3] mt-1 font-normal"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                >
                  Evaluating sensory conflict resolution, cognitive reaction latency, and crew operational stamina.
                </p>
              </div>

              {/* SMS Severity Options */}
              <div className="space-y-3">
                <label
                  className="block text-xs font-semibold text-white uppercase tracking-wider"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                >
                  Space Motion Sickness (SMS) Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['None', 'Mild', 'Moderate', 'Severe'].map(level => {
                    const isSelected = formData.smsSeverity === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleInputChange('smsSeverity', level)}
                        className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#161616] border-[#36C9E8] text-[#36C9E8] font-semibold shadow-md'
                            : 'bg-[#141414] border-[#252525] text-slate-300 hover:border-[#36C9E8]/30 font-normal'
                        }`}
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                      >
                        <div
                          className="text-sm font-semibold"
                          style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                        >
                          {level}
                        </div>
                        <div
                          className="text-[10px] text-[#A3A3A3] mt-0.5 font-normal"
                          style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                        >
                          {level === 'None' ? 'Optimal baseline' : level === 'Mild' ? 'Transient nausea' : level === 'Moderate' ? 'Countermeasure active' : 'Medical alert'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cognitive Alertness Slider */}
              <div className="p-4 rounded-xl bg-[#161616] border border-[#252525] space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    className="text-xs font-semibold text-white flex items-center gap-2"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    <Brain className="w-4 h-4 text-[#36C9E8]" />
                    <span>Cognitive Vigilance Score</span>
                  </label>
                  <span
                    className="text-xs font-semibold text-emerald-400"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    {formData.cognitiveAlertness} / 10 (Peak Cognitive Readiness)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={formData.cognitiveAlertness}
                  onChange={e => handleInputChange('cognitiveAlertness', e.target.value)}
                  className="w-full accent-[#36C9E8] cursor-pointer"
                />
                <div
                  className="flex justify-between text-[10px] text-[#A3A3A3] font-normal"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                >
                  <span>1: Impaired Reaction</span>
                  <span>5: Moderate Fatigue</span>
                  <span>10: EVA Certified Focus</span>
                </div>
              </div>

              {/* Workload Stress Radio */}
              <div className="space-y-3">
                <label
                  className="block text-xs font-semibold text-white uppercase tracking-wider"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                >
                  Perceived Workload Stress Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Low', 'Moderate', 'Elevated'].map(level => {
                    const isSelected = formData.workloadStress === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleInputChange('workloadStress', level)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#161616] border-emerald-400 text-emerald-300 font-semibold shadow-md'
                            : 'bg-[#141414] border-[#252525] text-slate-300 hover:border-[#36C9E8]/30 font-normal'
                        }`}
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                      >
                        <div
                          className="text-sm font-semibold"
                          style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                        >
                          {level}
                        </div>
                        <div
                          className="text-[10px] text-[#A3A3A3] mt-0.5 font-normal"
                          style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                        >
                          {level === 'Low' ? 'Balanced schedule' : level === 'Moderate' ? 'High EVA workload' : 'Countermeasure required'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subjective Comments */}
              <div className="space-y-2">
                <label
                  className="block text-xs font-semibold text-white uppercase tracking-wider"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                >
                  Subjective Observations &amp; Morale Log
                </label>
                <textarea
                  rows={3}
                  value={formData.astronautNotes}
                  onChange={e => handleInputChange('astronautNotes', e.target.value)}
                  placeholder="Record any cognitive shifts, psychological observations or equipment feedback..."
                  className="w-full p-3 rounded-xl bg-[#141414] border border-[#252525] focus:border-[#36C9E8] text-white text-xs outline-none leading-relaxed font-normal"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                />
              </div>
            </motion.div>
          )}

          {/* STEP 5: Health Summary, Review and Confirmation */}
          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#252525] space-y-6"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              <div className="border-b border-[#252525] pb-4">
                <div
                  className="text-xs font-semibold text-[#36C9E8] uppercase tracking-wider"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                >
                  Step 05 of 05 • Review &amp; Confirmation
                </div>
                <h2
                  className="text-xl font-bold text-white mt-1"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                >
                  Health Assessment Summary &amp; Confirmation
                </h2>
                <p
                  className="text-xs sm:text-sm text-[#A3A3A3] mt-1 font-normal"
                  style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                >
                  Verify all recorded metrics below before transmitting to the mission flight surgeon archive.
                </p>
              </div>

              {/* Overall Status Banner */}
              <div className="p-5 rounded-xl bg-[#161616] border border-[#252525] flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-semibold text-emerald-400 uppercase tracking-wider"
                        style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                      >
                        ASSESSMENT STATUS: STABLE
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 border border-white/10 text-cyan-300">
                        SIMULATED DATA
                      </span>
                    </div>
                    <div
                      className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5"
                      style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
                    >
                      All Parameters Within Simulated Baseline
                    </div>
                    <div
                      className="text-xs text-[#A3A3A3] mt-1 font-normal"
                      style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                    >
                      Astronaut: <span className="text-white font-semibold">{formData.astronautName}</span> • Crew ID: <span className="text-white font-mono">{formData.crewId}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className="text-xs text-[#A3A3A3] font-normal"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
                  >
                    Assessment Date &amp; Time
                  </div>
                  <div
                    className="text-sm font-semibold text-white"
                    style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
                  >
                    Today, 08:30 UTC
                  </div>
                </div>
              </div>

              {/* Summary Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-[#0E0E0E] border border-[#252525]">
                  <div className="text-[11px] text-[#A3A3A3] font-normal">Heart Rate</div>
                  <div className="text-lg font-bold text-white mt-1">{formData.heartRate} BPM</div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-normal">Normal sinus rhythm</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0E0E0E] border border-[#252525]">
                  <div className="text-[11px] text-[#A3A3A3] font-normal">Blood Oxygen (SpO2)</div>
                  <div className="text-lg font-bold text-white mt-1">{formData.bloodOxygen}%</div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-normal">Optimal saturation</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0E0E0E] border border-[#252525]">
                  <div className="text-[11px] text-[#A3A3A3] font-normal">Body Temperature</div>
                  <div className="text-lg font-bold text-white mt-1">{formData.temperature} °C</div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-normal">Nominal core temp</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0E0E0E] border border-[#252525]">
                  <div className="text-[11px] text-[#A3A3A3] font-normal">Blood Pressure</div>
                  <div className="text-lg font-bold text-white mt-1">{formData.bpSystolic}/{formData.bpDiastolic} mmHg</div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-normal">Normotensive reading</div>
                </div>
              </div>

              {/* Questionnaire Audit Checklist */}
              <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#252525] space-y-2 text-xs">
                <div className="font-semibold text-slate-300 pb-2 border-b border-[#202020] flex justify-between">
                  <span>Symptom, Sleep &amp; Activity Audit</span>
                  <span className="text-[#36C9E8]">Calibrated Telemetry</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300 font-normal">
                  <span>Sleep Duration &amp; Quality:</span>
                  <span className="font-semibold text-emerald-400">{formData.sleepHours} hrs ({formData.sleepQuality})</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300 font-normal">
                  <span>Exercise Countermeasures:</span>
                  <span className="font-semibold text-emerald-400">ARED {formData.aredDuration}m + T2 {formData.aerobicDuration}m</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300 font-normal">
                  <span>Space Motion Sickness:</span>
                  <span className="font-semibold text-emerald-400">{formData.smsSeverity} (None reported)</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300 font-normal">
                  <span>Cognitive Readiness Index:</span>
                  <span className="font-semibold text-emerald-400">{formData.cognitiveAlertness} / 10 (Peak Focus)</span>
                </div>
              </div>

              {/* Flight Surgeon Note */}
              <div className="p-3.5 rounded-xl bg-[#141414] border border-[#252525] flex items-start gap-3 text-xs text-[#A3A3A3]">
                <ShieldCheck className="w-4 h-4 text-[#36C9E8] shrink-0 mt-0.5" />
                <p className="font-normal" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}>
                  <strong className="text-white font-semibold">Autonomous Certification:</strong> Assessment verified for mission logging. Flight Surgeon Review: <span className="text-slate-200">Dr. Gregory Vance, MD (NASA JSC)</span>.
                </p>
              </div>
            </motion.div>
          )}

          {/* Stepper Navigation Controls */}
          <div
            className="flex items-center justify-between gap-4 pt-2"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3 rounded-xl border border-[#252525] bg-[#161616] hover:bg-[#202020] text-slate-200 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
              >
                Previous Step
              </button>
            ) : (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-5 py-3 rounded-xl border border-[#252525] bg-[#161616] hover:bg-[#202020] text-slate-300 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
              >
                Back to Dashboard
              </button>
            )}

            {currentStep < 5 ? (
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#36C9E8] hover:bg-cyan-400 text-black text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(54,201,232,0.3)] cursor-pointer"
                style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
              >
                <span>Continue to Step 0{currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
              >
                <Send className="w-4 h-4" />
                <span>Submit Assessment &amp; Sync</span>
              </button>
            )}
          </div>
        </form>
      ) : (
        /* Submission Success Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 sm:p-12 rounded-2xl bg-[#111111] border border-emerald-500/40 text-center space-y-6"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
            >
              SIMULATED TELEMETRY UPLINK CONFIRMED
            </span>
            <h2
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight pt-2"
              style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
            >
              Health Assessment Recorded
            </h2>
            <p
              className="text-sm text-[#A3A3A3] leading-relaxed font-normal"
              style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400 }}
            >
              Your physiological triage, sleep metrics, and mental stamina assessments have been logged into the mission archive. Status is evaluated as <strong className="text-white">Stable</strong>.
            </p>
          </div>

          <div
            className="p-4 rounded-xl bg-[#161616] border border-[#252525] max-w-md mx-auto text-xs text-[#A3A3A3] space-y-1.5"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <div className="flex justify-between">
              <span className="font-normal">Assessment ID:</span>
              <span className="font-mono text-white font-semibold">AST-ASM-20270420-94</span>
            </div>
            <div className="flex justify-between">
              <span className="font-normal">Telemetry Timestamp:</span>
              <span className="font-mono text-white font-semibold">Today, 08:35 UTC</span>
            </div>
            <div className="flex justify-between">
              <span className="font-normal">Evaluated Status:</span>
              <span className="text-emerald-400 font-semibold">Stable (Within Baseline)</span>
            </div>
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl border border-[#252525] bg-[#161616] hover:bg-[#202020] text-slate-300 text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-2 cursor-pointer"
              style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Perform New Assessment</span>
            </button>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-6 py-2.5 rounded-xl bg-[#36C9E8] hover:bg-cyan-400 text-black text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(54,201,232,0.3)] cursor-pointer"
              style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
            >
              <span>Return to Overview Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HealthAssessmentPage;
