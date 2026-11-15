import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardEdit,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Send,
  Info,
  UserCheck
} from 'lucide-react';
import {
  astronautsApi,
  measurementsApi,
  insightsApi,
  AstronautResponse,
  HealthMeasurementResponse,
  VitalsAnalysisResponse
} from '../../api';

interface ManualHealthEntryPageProps {
  onBackToDashboard: () => void;
  onNavigateToAnalytics?: () => void;
  astronautId?: string;
}

export const ManualHealthEntryPage: React.FC<ManualHealthEntryPageProps> = ({
  onBackToDashboard,
  onNavigateToAnalytics,
  astronautId: propAstronautId
}) => {
  // 1. Resolve Astronaut Profile
  const [astronauts, setAstronauts] = useState<AstronautResponse[]>([]);
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>('');
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  // 2. Form State
  const [measuredAt, setMeasuredAt] = useState<string>(() => {
    const now = new Date();
    // Format to YYYY-MM-DDTHH:mm for datetime-local input
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    return localIso;
  });

  const [heartRate, setHeartRate] = useState<string>('72');
  const [spo2, setSpo2] = useState<string>('98');
  const [systolicBp, setSystolicBp] = useState<string>('120');
  const [diastolicBp, setDiastolicBp] = useState<string>('80');
  const [bodyTemp, setBodyTemp] = useState<string>('36.8');

  // 3. UI Flow States
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<HealthMeasurementResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 4. Optional AI Anomaly Inference State
  const [aiRunning, setAiRunning] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<VitalsAnalysisResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Load available astronauts
  useEffect(() => {
    let isMounted = true;
    const loadAstronauts = async () => {
      try {
        setIsLoadingProfile(true);
        const list = await astronautsApi.list();
        if (isMounted) {
          setAstronauts(list);
          // Prefer prop -> cached -> first in list
          let targetId = propAstronautId;
          if (!targetId) {
            try {
              const cached = localStorage.getItem('astra_saved_references');
              if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.astronautId) targetId = parsed.astronautId;
              }
            } catch {
              // ignore
            }
          }
          if (!targetId && list.length > 0) {
            targetId = list[0].id;
          }
          setSelectedAstronautId(targetId || '');
        }
      } catch (err: any) {
        if (isMounted) setErrorMessage('Failed to connect to astronaut registry.');
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };
    loadAstronauts();
    return () => {
      isMounted = false;
    };
  }, [propAstronautId]);

  const activeAstronaut = useMemo(() => {
    return astronauts.find(a => a.id === selectedAstronautId) || astronauts[0] || null;
  }, [astronauts, selectedAstronautId]);

  // Derived Calculations
  const numericValues = useMemo(() => {
    const hr = parseFloat(heartRate);
    const o2 = parseFloat(spo2);
    const sbp = parseInt(systolicBp, 10);
    const dbp = parseInt(diastolicBp, 10);
    const temp = parseFloat(bodyTemp);

    const hasSbp = !isNaN(sbp) && sbp > 0;
    const hasDbp = !isNaN(dbp) && dbp > 0;

    let pulsePressure: number | null = null;
    let map: number | null = null;

    if (hasSbp && hasDbp) {
      pulsePressure = sbp - dbp;
      // MAP = DBP + (Pulse Pressure / 3)
      map = parseFloat((dbp + pulsePressure / 3).toFixed(1));
    }

    return {
      hr: isNaN(hr) ? null : hr,
      spo2: isNaN(o2) ? null : o2,
      sbp: hasSbp ? sbp : null,
      dbp: hasDbp ? dbp : null,
      temp: isNaN(temp) ? null : temp,
      pulsePressure,
      map
    };
  }, [heartRate, spo2, systolicBp, diastolicBp, bodyTemp]);

  // Physiological Validations
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (numericValues.hr === null) {
      errors.heartRate = 'Heart rate is required.';
    } else if (numericValues.hr < 30 || numericValues.hr > 240) {
      errors.heartRate = 'Heart rate must be between 30 and 240 BPM.';
    }

    if (numericValues.spo2 === null) {
      errors.spo2 = 'SpO2 percentage is required.';
    } else if (numericValues.spo2 < 70 || numericValues.spo2 > 100) {
      errors.spo2 = 'SpO2 must be between 70% and 100%.';
    }

    if (numericValues.sbp === null) {
      errors.systolicBp = 'Systolic BP is required.';
    } else if (numericValues.sbp < 60 || numericValues.sbp > 240) {
      errors.systolicBp = 'Systolic BP must be between 60 and 240 mmHg.';
    }

    if (numericValues.dbp === null) {
      errors.diastolicBp = 'Diastolic BP is required.';
    } else if (numericValues.dbp < 40 || numericValues.dbp > 140) {
      errors.diastolicBp = 'Diastolic BP must be between 40 and 140 mmHg.';
    }

    if (
      numericValues.sbp !== null &&
      numericValues.dbp !== null &&
      numericValues.sbp <= numericValues.dbp
    ) {
      errors.bloodPressure = 'Systolic BP must be greater than Diastolic BP.';
    }

    if (numericValues.temp !== null) {
      if (numericValues.temp < 34.0 || numericValues.temp > 42.0) {
        errors.bodyTemp = 'Body temperature must be between 34.0°C and 42.0°C.';
      }
    }

    if (!measuredAt) {
      errors.measuredAt = 'Measurement timestamp is required.';
    }

    return errors;
  }, [numericValues, measuredAt]);

  const isFormValid = Object.keys(validationErrors).length === 0;

  // Run AI Anomaly Inference (Optional Model Screening)
  const handleRunAiAnalysis = async () => {
    if (!isFormValid || numericValues.hr === null || numericValues.spo2 === null || numericValues.sbp === null || numericValues.dbp === null) {
      setAiError('All 4 vital metrics (HR, SpO2, SBP, DBP) must be valid to run the anomaly detector.');
      return;
    }

    setAiRunning(true);
    setAiError(null);

    try {
      const response = await insightsApi.analyze({
        heart_rate_bpm: numericValues.hr,
        spo2_pct: numericValues.spo2,
        systolic_bp_mmhg: numericValues.sbp,
        diastolic_bp_mmhg: numericValues.dbp,
        pulse_pressure_mmhg: numericValues.pulsePressure || undefined,
        map_mmhg: numericValues.map || undefined
      });
      setAiResult(response);
    } catch (err: any) {
      setAiError(err.message || 'AI Anomaly Model service is currently unreachable.');
    } finally {
      setAiRunning(false);
    }
  };

  // Submit to Database
  const handleConfirmSubmit = async () => {
    if (!isFormValid || !selectedAstronautId) {
      setErrorMessage('Please correct validation errors before saving.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const record = await measurementsApi.create({
        astronaut_id: selectedAstronautId,
        measured_at: new Date(measuredAt).toISOString(),
        heart_rate_bpm: numericValues.hr ?? undefined,
        blood_oxygen_pct: numericValues.spo2 ?? undefined,
        systolic_bp_mmhg: numericValues.sbp ?? undefined,
        diastolic_bp_mmhg: numericValues.dbp ?? undefined,
        body_temperature_celsius: numericValues.temp ?? undefined,
        source: 'manual',
        is_simulated: false
      });

      setSubmitSuccess(record);
      setIsReviewOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save manual health entry to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setHeartRate('72');
    setSpo2('98');
    setSystolicBp('120');
    setDiastolicBp('80');
    setBodyTemp('36.8');
    setSubmitSuccess(null);
    setAiResult(null);
    setIsReviewOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-space">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#252525]">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="p-1.5 rounded-lg border border-[#252525] bg-[#111111] text-[#A3A3A3] hover:text-white transition-colors"
              title="Return to Dashboard Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <ClipboardEdit className="w-5 h-5 text-[#36C9E8]" />
              <h1 className="font-orbitron font-bold text-lg sm:text-xl text-white tracking-wide">
                Manual Health Entry
              </h1>
            </div>
          </div>
          <p className="text-xs text-[#A3A3A3] mt-1 ml-9">
            Direct clinical entry of astronaut vital biometrics without live hardware sensor telemetry.
          </p>
        </div>

        {/* Status Tag */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-[#36C9E8]/10 text-[#36C9E8] border border-[#36C9E8]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#36C9E8]" />
            Sensor-Free Mode • source: manual
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {submitSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Measurement Recorded Successfully</div>
              <div className="text-xs text-emerald-400/80 font-mono mt-0.5">
                Record ID: {submitSuccess.id} • Source: {submitSuccess.source} • Simulated: false
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetForm}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#161616] hover:bg-[#202020] text-white border border-[#333333] transition-colors"
            >
              Enter Another
            </button>
            {onNavigateToAnalytics && (
              <button
                onClick={onNavigateToAnalytics}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black transition-colors"
              >
                View in Analytics
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Entry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Metadata Card: Astronaut & Timestamp */}
          <div className="p-5 rounded-xl bg-[#0D0D0D] border border-[#252525] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E1E1E]">
              <span className="font-orbitron font-semibold text-xs tracking-wider text-white uppercase flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#36C9E8]" />
                Subject & Telemetry Context
              </span>
              <span className="text-[10px] font-mono text-[#A3A3A3]">STEP 1 OF 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Astronaut Selector */}
              <div>
                <label className="block text-xs text-[#A3A3A3] mb-1.5">Monitored Astronaut</label>
                {isLoadingProfile ? (
                  <div className="h-10 rounded-lg bg-[#161616] animate-pulse border border-[#252525]" />
                ) : (
                  <select
                    value={selectedAstronautId}
                    onChange={e => setSelectedAstronautId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#161616] border border-[#252525] text-white text-xs focus:outline-none focus:border-[#36C9E8]"
                  >
                    {astronauts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.crew_id || 'AST-OPS'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Timestamp Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-[#A3A3A3]">Observation Timestamp</label>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16);
                      setMeasuredAt(localIso);
                    }}
                    className="text-[10px] text-[#36C9E8] hover:underline"
                  >
                    Set to Now
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={measuredAt}
                  onChange={e => setMeasuredAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161616] border border-[#252525] text-white text-xs focus:outline-none focus:border-[#36C9E8]"
                />
              </div>
            </div>
          </div>

          {/* Core Physiological Form */}
          <div className="p-5 rounded-xl bg-[#0D0D0D] border border-[#252525] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E1E1E]">
              <span className="font-orbitron font-semibold text-xs tracking-wider text-white uppercase flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#36C9E8]" />
                Physiological Vital Signs
              </span>
              <span className="text-[10px] text-[#A3A3A3]">Physical Units</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Heart Rate */}
              <div className="p-3.5 rounded-lg bg-[#111111] border border-[#222222]">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs text-white font-medium">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    Heart Rate
                  </label>
                  <span className="text-[10px] text-[#A3A3A3] font-mono">BPM (30–240)</span>
                </div>
                <input
                  type="number"
                  min="30"
                  max="240"
                  value={heartRate}
                  onChange={e => setHeartRate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-[#161616] border text-white text-sm font-mono focus:outline-none ${
                    validationErrors.heartRate ? 'border-rose-500' : 'border-[#252525] focus:border-[#36C9E8]'
                  }`}
                  placeholder="e.g. 72"
                />
                {validationErrors.heartRate && (
                  <p className="text-[11px] text-rose-400 mt-1">{validationErrors.heartRate}</p>
                )}
              </div>

              {/* SpO2 */}
              <div className="p-3.5 rounded-lg bg-[#111111] border border-[#222222]">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs text-white font-medium">
                    <Droplets className="w-3.5 h-3.5 text-[#36C9E8]" />
                    Blood Oxygen (SpO2)
                  </label>
                  <span className="text-[10px] text-[#A3A3A3] font-mono">% (70–100)</span>
                </div>
                <input
                  type="number"
                  min="70"
                  max="100"
                  value={spo2}
                  onChange={e => setSpo2(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-[#161616] border text-white text-sm font-mono focus:outline-none ${
                    validationErrors.spo2 ? 'border-rose-500' : 'border-[#252525] focus:border-[#36C9E8]'
                  }`}
                  placeholder="e.g. 98"
                />
                {validationErrors.spo2 && (
                  <p className="text-[11px] text-rose-400 mt-1">{validationErrors.spo2}</p>
                )}
              </div>

              {/* Systolic Blood Pressure */}
              <div className="p-3.5 rounded-lg bg-[#111111] border border-[#222222]">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs text-white font-medium">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    Systolic Blood Pressure
                  </label>
                  <span className="text-[10px] text-[#A3A3A3] font-mono">mmHg (60–240)</span>
                </div>
                <input
                  type="number"
                  min="60"
                  max="240"
                  value={systolicBp}
                  onChange={e => setSystolicBp(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-[#161616] border text-white text-sm font-mono focus:outline-none ${
                    validationErrors.systolicBp ? 'border-rose-500' : 'border-[#252525] focus:border-[#36C9E8]'
                  }`}
                  placeholder="e.g. 120"
                />
                {validationErrors.systolicBp && (
                  <p className="text-[11px] text-rose-400 mt-1">{validationErrors.systolicBp}</p>
                )}
              </div>

              {/* Diastolic Blood Pressure */}
              <div className="p-3.5 rounded-lg bg-[#111111] border border-[#222222]">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs text-white font-medium">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    Diastolic Blood Pressure
                  </label>
                  <span className="text-[10px] text-[#A3A3A3] font-mono">mmHg (40–140)</span>
                </div>
                <input
                  type="number"
                  min="40"
                  max="140"
                  value={diastolicBp}
                  onChange={e => setDiastolicBp(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-[#161616] border text-white text-sm font-mono focus:outline-none ${
                    validationErrors.diastolicBp || validationErrors.bloodPressure ? 'border-rose-500' : 'border-[#252525] focus:border-[#36C9E8]'
                  }`}
                  placeholder="e.g. 80"
                />
                {validationErrors.diastolicBp && (
                  <p className="text-[11px] text-rose-400 mt-1">{validationErrors.diastolicBp}</p>
                )}
                {validationErrors.bloodPressure && (
                  <p className="text-[11px] text-rose-400 mt-1">{validationErrors.bloodPressure}</p>
                )}
              </div>

              {/* Body Temperature (Optional / Supported) */}
              <div className="p-3.5 rounded-lg bg-[#111111] border border-[#222222] sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs text-white font-medium">
                    <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
                    Core Body Temperature
                  </label>
                  <span className="text-[10px] text-[#A3A3A3] font-mono">°C (34.0–42.0)</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="34.0"
                  max="42.0"
                  value={bodyTemp}
                  onChange={e => setBodyTemp(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-[#161616] border text-white text-sm font-mono focus:outline-none ${
                    validationErrors.bodyTemp ? 'border-rose-500' : 'border-[#252525] focus:border-[#36C9E8]'
                  }`}
                  placeholder="e.g. 36.8"
                />
                {validationErrors.bodyTemp && (
                  <p className="text-[11px] text-rose-400 mt-1">{validationErrors.bodyTemp}</p>
                )}
              </div>

            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#1E1E1E] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-3 py-2 rounded-lg border border-[#252525] text-xs text-[#A3A3A3] hover:text-white hover:bg-[#161616] transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Values
              </button>

              <button
                type="button"
                disabled={!isFormValid || isLoadingProfile}
                onClick={() => setIsReviewOpen(true)}
                className="px-5 py-2 rounded-lg bg-[#36C9E8] hover:bg-[#20b2d6] text-black font-semibold text-xs transition-all shadow-md shadow-[#36C9E8]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Review & Confirm Entry
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Live Derived Metrics & AI Screening */}
        <div className="space-y-6">
          
          {/* Derived Hemodynamic Calculations Card */}
          <div className="p-5 rounded-xl bg-[#0D0D0D] border border-[#252525] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1E1E1E]">
              <Activity className="w-4 h-4 text-[#36C9E8]" />
              <span className="font-orbitron font-semibold text-xs tracking-wider text-white uppercase">
                Calculated Metrics
              </span>
            </div>

            <div className="space-y-3">
              {/* Pulse Pressure */}
              <div className="p-3 rounded-lg bg-[#111111] border border-[#222222]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A3A3A3]">Pulse Pressure (PP)</span>
                  <span className="text-[10px] font-mono text-[#36C9E8]">SBP - DBP</span>
                </div>
                <div className="text-lg font-orbitron font-bold text-white mt-1">
                  {numericValues.pulsePressure !== null ? (
                    <span>{numericValues.pulsePressure} <span className="text-xs font-normal text-[#A3A3A3]">mmHg</span></span>
                  ) : (
                    <span className="text-sm font-normal text-[#666666]">Requires SBP & DBP</span>
                  )}
                </div>
                <div className="text-[10px] text-[#777777] mt-0.5">
                  Normal resting range: 30–50 mmHg. Evaluates arterial stiffness.
                </div>
              </div>

              {/* Mean Arterial Pressure */}
              <div className="p-3 rounded-lg bg-[#111111] border border-[#222222]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A3A3A3]">Mean Arterial Pressure (MAP)</span>
                  <span className="text-[10px] font-mono text-[#36C9E8]">DBP + (PP / 3)</span>
                </div>
                <div className="text-lg font-orbitron font-bold text-white mt-1">
                  {numericValues.map !== null ? (
                    <span>{numericValues.map} <span className="text-xs font-normal text-[#A3A3A3]">mmHg</span></span>
                  ) : (
                    <span className="text-sm font-normal text-[#666666]">Requires SBP & DBP</span>
                  )}
                </div>
                <div className="text-[10px] text-[#777777] mt-0.5">
                  Normal resting range: 70–105 mmHg. Reflects organ perfusion pressure.
                </div>
              </div>
            </div>
          </div>

          {/* Optional AI Anomaly Detector Preview */}
          <div className="p-5 rounded-xl bg-[#0D0D0D] border border-[#252525] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E1E1E]">
              <span className="font-orbitron font-semibold text-xs tracking-wider text-white uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Model Screening
              </span>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                IsolationForest
              </span>
            </div>

            <p className="text-xs text-[#A3A3A3]">
              Submit entered parameters to the trained ML Isolation Forest model to screen for multi-variable statistical deviations.
            </p>

            <button
              type="button"
              disabled={!isFormValid || aiRunning}
              onClick={handleRunAiAnalysis}
              className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {aiRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Biometrics...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Run AI Anomaly Screen
                </>
              )}
            </button>

            {aiError && (
              <p className="text-[11px] text-rose-400 mt-2">{aiError}</p>
            )}

            {aiResult && (
              <div className="p-3.5 rounded-lg bg-[#141414] border border-[#2A2A2A] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#A3A3A3]">Model Classification:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] font-mono ${
                      aiResult.is_anomaly
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {aiResult.prediction_label.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#888888]">Statistical Anomaly Index:</span>
                  <span className="font-mono text-white">
                    {aiResult.normalized_anomaly_score.toFixed(3)} <span className="text-[#666666] text-[10px]">(0.000–1.000)</span>
                  </span>
                </div>
                <p className="text-[10px] text-cyan-400/80 pt-0.5 font-mono">
                  *Statistical pattern departure index only. Not an illness probability or clinical risk percentage.
                </p>
                <p className="text-[11px] text-[#A3A3A3] pt-1 border-t border-[#222222]">
                  {aiResult.summary_message}
                </p>
                <p className="text-[9px] text-[#666666] leading-tight italic pt-1">
                  {aiResult.disclaimer}
                </p>
              </div>
            )}
          </div>

          {/* Clinical Integrity Notice */}
          <div className="p-4 rounded-xl bg-[#111111] border border-[#252525] text-[11px] text-[#888888] space-y-1.5">
            <div className="flex items-center gap-1.5 text-white font-medium">
              <Info className="w-3.5 h-3.5 text-[#36C9E8]" />
              Data Integrity Policy
            </div>
            <p>
              Manual recordings are permanently tagged with <code className="text-[#36C9E8] font-mono">source="manual"</code> and <code className="text-[#36C9E8] font-mono">is_simulated=false</code> to strictly distinguish human-entered values from continuous telemetry downlinks.
            </p>
          </div>

        </div>
      </div>

      {/* Confirmation & Review Modal */}
      <AnimatePresence>
        {isReviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F0F0F] border border-[#333333] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#36C9E8]" />
                  <h3 className="font-orbitron font-bold text-sm text-white">
                    Confirm Manual Entry
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#36C9E8] bg-[#36C9E8]/10 px-2 py-0.5 rounded border border-[#36C9E8]/20">
                  Pre-Commit Review
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-[#141414] border border-[#222222] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Operative:</span>
                    <span className="text-white font-semibold">{activeAstronaut?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Timestamp:</span>
                    <span className="text-white font-mono">{new Date(measuredAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Telemetry Tag:</span>
                    <span className="text-[#36C9E8] font-mono">source="manual" • simulated=false</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#161616] border border-[#252525]">
                    <div className="text-[10px] text-[#888888]">Heart Rate</div>
                    <div className="font-orbitron font-bold text-white text-sm">{numericValues.hr} BPM</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#161616] border border-[#252525]">
                    <div className="text-[10px] text-[#888888]">Oxygen Saturation</div>
                    <div className="font-orbitron font-bold text-white text-sm">{numericValues.spo2}%</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#161616] border border-[#252525]">
                    <div className="text-[10px] text-[#888888]">Blood Pressure</div>
                    <div className="font-orbitron font-bold text-white text-sm">
                      {numericValues.sbp} / {numericValues.dbp} mmHg
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#161616] border border-[#252525]">
                    <div className="text-[10px] text-[#888888]">Body Temp</div>
                    <div className="font-orbitron font-bold text-white text-sm">{numericValues.temp}°C</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#161616]/60 border border-[#252525] flex justify-between text-xs font-mono">
                  <span className="text-[#888888]">Derived Pulse Pressure: <strong className="text-white">{numericValues.pulsePressure} mmHg</strong></span>
                  <span className="text-[#888888]">Derived MAP: <strong className="text-white">{numericValues.map} mmHg</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#252525] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-[#A3A3A3] hover:text-white transition-colors"
                >
                  Edit Values
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmSubmit}
                  className="px-5 py-2 rounded-lg bg-[#36C9E8] hover:bg-[#20b2d6] text-black font-semibold text-xs transition-all shadow-md shadow-[#36C9E8]/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Commit to Record
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
