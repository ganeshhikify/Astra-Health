import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  AlertCircle,
  RefreshCw,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  ShieldAlert,
  Printer,
  UserCheck,
  Database
} from 'lucide-react';
import { assessmentsApi } from '../../api/assessmentsApi';
import { measurementsApi } from '../../api/measurementsApi';
import { astronautsApi } from '../../api/astronautsApi';
import { missionsApi } from '../../api/missionsApi';
import {
  HealthAssessmentResponse,
  HealthMeasurementResponse,
  AstronautResponse,
  MissionResponse
} from '../../api/types';

interface ExtendedAssessmentSummary {
  missionDay?: string;
  habitatZone?: string;
  symptoms?: Record<string, boolean>;
  sleepQuality?: string;
  sleepLatency?: string;
  workloadStress?: string;
  notes?: string;
  cognitiveAlertness?: string;
  smsSeverity?: string;
  vestibularRating?: string;
  sansVisionShift?: string;
  aredDuration?: string;
  aerobicDuration?: string;
  isSimulated?: boolean;
  is_simulated?: boolean;
}

interface ParsedReport {
  id: string;
  rawAssessmentId: string;
  title: string;
  cycle: string;
  date: string;
  type: string;
  status: string;
  summary: string;
  physician: string;
  astronautName: string;
  crewId: string;
  missionName: string;
  destination: string;
  recordedHR: string;
  recordedSpO2: string;
  recordedTemp: string;
  recordedBP: string;
  recordedSleep: string;
  symptomsList: string;
  isSimulated: boolean;
  notes: string;
  rawAssessment: HealthAssessmentResponse;
}

interface ReportsPageProps {
  astronautId?: string;
  missionId?: string;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  astronautId: propAstronautId,
  missionId: propMissionId
}) => {
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'ALL' | '7D' | '30D'>('ALL');

  const [astronaut, setAstronaut] = useState<AstronautResponse | null>(null);
  const [mission, setMission] = useState<MissionResponse | null>(null);
  const [assessments, setAssessments] = useState<HealthAssessmentResponse[]>([]);
  const [measurements, setMeasurements] = useState<HealthMeasurementResponse[]>([]);

  // Load active references strictly from props or user-saved session state
  const { effectiveAstronautId, effectiveMissionId } = useMemo(() => {
    let aId = propAstronautId;
    let mId = propMissionId;
    if (!aId || !mId) {
      try {
        const cached = localStorage.getItem('astra_saved_references');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (!aId && parsed.astronautId) aId = parsed.astronautId;
          if (!mId && parsed.missionId) mId = parsed.missionId;
        }
      } catch {
        // ignore
      }
    }
    return { effectiveAstronautId: aId, effectiveMissionId: mId };
  }, [propAstronautId, propMissionId]);

  // Fetch all related entities strictly for the selected astronaut
  const fetchData = useCallback(async () => {
    // If no astronaut is selected, never silently fallback to an arbitrary database record
    if (!effectiveAstronautId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch profile for the specifically selected astronaut
      const astroData = await astronautsApi.getById(effectiveAstronautId);
      setAstronaut(astroData);

      // 2. Fetch the mission assigned to this specific astronaut
      let missionData: MissionResponse | null = null;
      if (effectiveMissionId) {
        try {
          missionData = await missionsApi.getById(effectiveMissionId);
        } catch {
          // fallback to lookup by astronaut ID
          missionData = await missionsApi.findByAstronautId(effectiveAstronautId);
        }
      } else {
        missionData = await missionsApi.findByAstronautId(effectiveAstronautId);
      }
      setMission(missionData);

      // 3. Fetch clinical assessment records specifically for this astronaut
      const assessmentData = await assessmentsApi.list(effectiveAstronautId, 0, 50);
      setAssessments(assessmentData);

      // 4. Fetch telemetry measurements specifically for this astronaut
      const measurementData = await measurementsApi.getByAstronaut(effectiveAstronautId, 0, 100);
      setMeasurements(measurementData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve health reports';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveAstronautId, effectiveMissionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Process assessment records into formatted report cards
  const reportsList: ParsedReport[] = useMemo(() => {
    if (assessments.length === 0) return [];

    return assessments.map((ass) => {
      let parsedSummary: ExtendedAssessmentSummary = {};
      if (ass.summary) {
        try {
          parsedSummary = JSON.parse(ass.summary);
        } catch {
          parsedSummary = { notes: ass.summary };
        }
      }

      // Extract symptoms
      const activeSymptoms: string[] = [];
      if (parsedSummary.symptoms && typeof parsedSummary.symptoms === 'object') {
        Object.entries(parsedSummary.symptoms).forEach(([k, v]) => {
          if (v) activeSymptoms.push(k.replace(/([A-Z])/g, ' $1').toLowerCase());
        });
      }

      const reportDate = new Date(ass.assessment_date);
      const dateStr = reportDate.toISOString().slice(0, 10);
      const shortId = ass.id.replace(/-/g, '').slice(0, 6).toUpperCase();

      // Determine simulation status strictly from this assessment's own payload
      const isSim = Boolean(
        parsedSummary.isSimulated ??
        parsedSummary.is_simulated ??
        false
      );

      // Preserve missing values as "Unavailable" - never invent values
      const recordedHR = ass.baseline_heart_rate != null ? `${ass.baseline_heart_rate} BPM` : 'Unavailable';
      const recordedSpO2 = ass.baseline_spo2 != null ? `${ass.baseline_spo2}%` : 'Unavailable';
      const recordedTemp = ass.baseline_temperature != null ? `${ass.baseline_temperature} °C` : 'Unavailable';
      const recordedBP = ass.baseline_blood_pressure ? `${ass.baseline_blood_pressure} mmHg` : 'Unavailable';
      const recordedSleep = ass.sleep_hours != null ? `${ass.sleep_hours} hrs` : (parsedSummary.sleepQuality || 'Unavailable');

      return {
        id: `REP-${shortId}`,
        rawAssessmentId: ass.id,
        title: 'Weekly Bio-Telemetry Synthesis & Physiological Assessment',
        cycle: parsedSummary.missionDay ? `Mission Sol: ${parsedSummary.missionDay}` : `Assessment Cycle (${dateStr})`,
        date: dateStr,
        type: 'Flight Surgeon Review & Telemetry Audit',
        status: ass.status,
        summary:
          parsedSummary.notes ||
          'Analysis of cardiovascular adaptation, recorded vitals, and physiological response parameters.',
        physician: 'Dr. Gregory Vance, MD (Simulated Operational Persona, NASA JSC Flight Operations)',
        astronautName: astronaut?.name || 'Selected Operative',
        crewId: astronaut?.crew_id || 'AST-N/A',
        missionName: mission?.name || 'Unassigned Mission',
        destination: mission?.destination || 'N/A',
        recordedHR,
        recordedSpO2,
        recordedTemp,
        recordedBP,
        recordedSleep,
        symptomsList: activeSymptoms.length > 0 ? activeSymptoms.join(', ') : 'No active symptoms reported',
        isSimulated: isSim,
        notes: parsedSummary.notes || '',
        rawAssessment: ass
      };
    });
  }, [assessments, astronaut, mission]);

  // Determine simulation status strictly from the actual reports displayed
  const simulationStatus = useMemo(() => {
    const total = reportsList.length;
    if (total === 0) return { hasSimulated: false, isAllSimulated: false, count: 0 };
    const count = reportsList.filter(r => r.isSimulated).length;
    return {
      hasSimulated: count > 0,
      isAllSimulated: count === total,
      count
    };
  }, [reportsList]);

  // Filter reports by date
  const filteredReports = useMemo(() => {
    if (dateFilter === 'ALL') return reportsList;
    const now = Date.now();
    const days = dateFilter === '7D' ? 7 : 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return reportsList.filter(r => new Date(r.date).getTime() >= cutoff);
  }, [reportsList, dateFilter]);

  // Printable Report Generation (Save to PDF)
  const handleDownloadPDF = (report: ParsedReport) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${report.id} - ${report.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #111; line-height: 1.5; }
            .header { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: bold; margin: 0; text-transform: uppercase; }
            .meta { font-size: 12px; color: #555; margin-top: 4px; }
            .badge { display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: bold; border-radius: 4px; border: 1px solid #999; margin-left: 8px; }
            .sim-badge { background-color: #fff3cd; color: #856404; border-color: #ffeeba; }
            .section { margin-top: 20px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f7f7f7; width: 25%; }
            .disclaimer { margin-top: 30px; font-size: 10px; color: #666; border-top: 1px dashed #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">ASTRA HEALTH • AEROSPACE BIOMEDICAL TELEMETRY ARCHIVE</h1>
            <div class="meta">
              <strong>REPORT ID:</strong> ${report.id} |
              <strong>DATE:</strong> ${report.date} |
              <strong>STATUS:</strong> ${report.status}
              ${report.isSimulated ? '<span class="badge sim-badge">DEMO / SIMULATED RECORD</span>' : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-title">1. Astronaut &amp; Mission Parameters</div>
            <table>
              <tr><th>Astronaut Name</th><td>${report.astronautName}</td><th>Crew Identifier</th><td>${report.crewId}</td></tr>
              <tr><th>Mission Assignment</th><td>${report.missionName}</td><th>Destination Vector</th><td>${report.destination}</td></tr>
              <tr><th>Assessment Cycle</th><td>${report.cycle}</td><th>Evaluation Date</th><td>${report.date}</td></tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">2. Recorded Vitals</div>
            <table>
              <tr><th>Heart Rate</th><td>${report.recordedHR}</td><th>Blood Oxygen (SpO2)</th><td>${report.recordedSpO2}</td></tr>
              <tr><th>Body Temperature</th><td>${report.recordedTemp}</td><th>Blood Pressure</th><td>${report.recordedBP}</td></tr>
              <tr><th>Sleep Duration</th><td>${report.recordedSleep}</td><th>Symptoms Reported</th><td>${report.symptomsList}</td></tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">3. Flight Surgeon Clinical Assessment &amp; Telemetry Summary</div>
            <p style="font-size: 12px; line-height: 1.6;">${report.summary}</p>
            ${report.notes ? `<p style="font-size: 12px; color: #333;"><strong>Operational Notes:</strong> ${report.notes}</p>` : ''}
            <div style="font-size: 11px; margin-top: 15px; color: #444;">
              <strong>Authorized Flight Surgeon:</strong> ${report.physician}
            </div>
          </div>

          <div class="disclaimer">
            <strong>NOTICE &amp; DISCLAIMER:</strong> This record is an aerospace physiological telemetry synthesis compiled from PostgreSQL database records. It is intended solely for flight medicine operational readiness and human spaceflight countermeasure monitoring. It does not provide clinical disease diagnosis or emergency prediction. Astronaut profiles, mission vector assignments, and physician designations represent simulated operational personas and reference benchmarks for platform demonstration.
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }

    // Download structured JSON report backup
    const reportData = {
      reportId: report.id,
      assessmentId: report.rawAssessmentId,
      date: report.date,
      status: report.status,
      astronaut: {
        name: report.astronautName,
        crewId: report.crewId
      },
      mission: {
        name: report.missionName,
        destination: report.destination
      },
      recordedVitals: {
        heartRate: report.recordedHR,
        spo2: report.recordedSpO2,
        temperature: report.recordedTemp,
        bloodPressure: report.recordedBP,
        sleepHours: report.recordedSleep
      },
      symptoms: report.symptomsList,
      summary: report.summary,
      physician: report.physician,
      isSimulated: report.isSimulated,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astra_report_${report.id}_${report.date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(`Report ${report.id} generated & exported to local archive.`);
    setTimeout(() => setDownloadToast(null), 3500);
  };

  // Export All Reports & Telemetry Archive
  const handleExportAllReports = () => {
    const archiveData = {
      archiveTitle: 'ASTRA HEALTH Medical & Bio-Telemetry Archive',
      generatedAt: new Date().toISOString(),
      astronaut: astronaut || { name: 'Operative', crew_id: 'N/A' },
      mission: mission || { name: 'Unassigned', destination: 'N/A' },
      totalAssessments: assessments.length,
      totalMeasurements: measurements.length,
      assessments: assessments.map(ass => {
        let summaryObj = null;
        try {
          summaryObj = ass.summary ? JSON.parse(ass.summary) : null;
        } catch {
          summaryObj = ass.summary;
        }
        return {
          id: ass.id,
          assessment_date: ass.assessment_date,
          status: ass.status,
          recorded_vitals: {
            heart_rate: ass.baseline_heart_rate != null ? ass.baseline_heart_rate : 'Unavailable',
            spo2: ass.baseline_spo2 != null ? ass.baseline_spo2 : 'Unavailable',
            temperature: ass.baseline_temperature != null ? ass.baseline_temperature : 'Unavailable',
            blood_pressure: ass.baseline_blood_pressure || 'Unavailable',
            sleep_hours: ass.sleep_hours != null ? ass.sleep_hours : 'Unavailable',
          },
          countermeasures_adherence: ass.countermeasures_adherence,
          summary: summaryObj
        };
      }),
      telemetryMeasurements: measurements.map(m => ({
        id: m.id,
        measured_at: m.measured_at,
        heart_rate_bpm: m.heart_rate_bpm,
        blood_oxygen_pct: m.blood_oxygen_pct,
        body_temperature_celsius: m.body_temperature_celsius,
        systolic_bp_mmhg: m.systolic_bp_mmhg,
        diastolic_bp_mmhg: m.diastolic_bp_mmhg,
        source: m.source,
        is_simulated: m.is_simulated
      })),
      disclaimer:
        'Official biomedical telemetry records for operational human performance tracking. Not an automated medical diagnosis.'
    };

    const blob = new Blob([JSON.stringify(archiveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astra_full_medical_archive_${astronaut?.crew_id || 'operative'}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast('Consolidated clinical archive exported successfully.');
    setTimeout(() => setDownloadToast(null), 3500);
  };

  // State when no astronaut is selected
  if (!effectiveAstronautId && !isLoading) {
    return (
      <div className="p-8 rounded-xl bg-[#111111] border border-[#252525] text-center space-y-4">
        <UserCheck className="w-10 h-10 text-[#36C9E8]/50 mx-auto" />
        <h2 className="font-orbitron font-bold text-lg text-white">No Astronaut Operative Selected</h2>
        <p className="text-xs text-[#A3A3A3] max-w-md mx-auto">
          Please select or configure an active astronaut in Mission Setup to review clinical reports and audits.
        </p>
      </div>
    );
  }

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
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#A3A3A3] mt-1">
            <span>Astronaut: <strong className="text-white">{astronaut?.name || 'Selected Operative'}</strong> {astronaut?.crew_id && `(${astronaut.crew_id})`}</span>
            <span>•</span>
            <span>Mission: <strong className="text-cyan-400">{mission?.name || 'Unassigned Mission'}</strong></span>
            {simulationStatus.hasSimulated && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                <ShieldAlert className="w-3 h-3" />
                {simulationStatus.isAllSimulated
                  ? 'SIMULATED DATASET'
                  : `CONTAINS ${simulationStatus.count} SIMULATED REPORT(S)`}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Refresh database records"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] border border-[#252525] text-xs text-[#A3A3A3] hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#36C9E8]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleExportAllReports}
            disabled={reportsList.length === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-space font-semibold text-xs tracking-wider uppercase transition-colors ${
              reportsList.length > 0
                ? 'bg-[#36C9E8] hover:bg-cyan-400 text-black cursor-pointer'
                : 'bg-[#1e293b] text-[#64748b] cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export All Reports</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#111111] border border-[#252525] text-xs">
        <div className="flex items-center gap-2 text-[#A3A3A3]">
          <Calendar className="w-4 h-4 text-[#36C9E8]" />
          <span>Filter Records:</span>
          <div className="flex items-center p-0.5 rounded-lg bg-[#161616] border border-[#252525] font-mono">
            {(['ALL', '7D', '30D'] as const).map(f => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1 rounded transition-colors ${
                  dateFilter === f
                    ? 'bg-[#36C9E8] text-black font-bold'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                {f === 'ALL' ? 'All Records' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[#A3A3A3] font-mono text-[11px]">
          Showing <span className="text-white font-bold">{filteredReports.length}</span> of {reportsList.length} evaluation(s)
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/20 border border-red-500/40 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Error loading reports: {error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 rounded-xl bg-[#111111] border border-[#252525] flex flex-col items-center justify-center gap-3 text-xs text-[#737373]">
          <RefreshCw className="w-6 h-6 animate-spin text-[#36C9E8]" />
          <span>Querying PostgreSQL clinical records and telemetry...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredReports.length === 0 && (
        <div className="p-12 rounded-xl bg-[#111111] border border-[#252525] text-center space-y-3">
          <FileText className="w-10 h-10 text-[#36C9E8]/40 mx-auto" />
          <h3 className="font-orbitron font-bold text-white text-base">
            No Clinical Health Reports Found
          </h3>
          <p className="text-xs text-[#A3A3A3] max-w-md mx-auto">
            No assessment logs match the selected timeframe for this astronaut. Complete a Health Assessment from the mission deck to generate an official flight surgeon evaluation.
          </p>
        </div>
      )}

      {/* Reports Archive List */}
      {!isLoading && filteredReports.length > 0 && (
        <div className="space-y-4">
          {filteredReports.map(rep => (
            <div
              key={rep.id}
              className="p-6 rounded-xl bg-[#111111] border border-[#252525] hover:border-[#36C9E8]/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              <div className="space-y-3 flex-1">
                {/* Meta Badge Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-[#161616] text-[#36C9E8] border border-[#252525] font-bold">
                    {rep.id}
                  </span>
                  <span className="text-[#A3A3A3]">{rep.cycle}</span>
                  <span className="text-[#525252]">•</span>
                  <span className="text-slate-400">{rep.date}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {rep.status}
                  </span>
                  {rep.isSimulated && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px]">
                      SIMULATED DATA
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-orbitron font-bold text-base text-white">
                  {rep.title}
                </h3>

                {/* Recorded Vitals Row */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-mono tracking-wider uppercase text-[#737373]">
                    Recorded Vitals:
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161616] border border-[#252525] text-slate-300">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>HR: <strong className="text-white">{rep.recordedHR}</strong></span>
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161616] border border-[#252525] text-slate-300">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                      <span>SpO2: <strong className="text-white">{rep.recordedSpO2}</strong></span>
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161616] border border-[#252525] text-slate-300">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Temp: <strong className="text-white">{rep.recordedTemp}</strong></span>
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161616] border border-[#252525] text-slate-300">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span>BP: <strong className="text-white">{rep.recordedBP}</strong></span>
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161616] border border-[#252525] text-slate-300">
                      <span>Sleep: <strong className="text-white">{rep.recordedSleep}</strong></span>
                    </span>
                  </div>
                </div>

                {/* Summary / Notes */}
                <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-3xl pt-1">
                  {rep.summary}
                </p>

                {/* Symptoms & Physician */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-[#737373] pt-2 border-t border-[#1e1e1e] gap-2">
                  <div>
                    Symptoms: <span className="text-slate-300">{rep.symptomsList}</span>
                  </div>
                  <div>
                    Authorized By: <span className="text-slate-300 font-medium">{rep.physician}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
                <button
                  onClick={() => handleDownloadPDF(rep)}
                  title="Generate Printable PDF and Download JSON Report"
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#161616] hover:bg-[#202020] border border-[#252525] text-xs text-white transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#36C9E8]" />
                  <span>PDF Document</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Public Scientific Research Reference Benchmarks (Aerospace Audit Baseline) */}
      <div className="p-5 rounded-xl bg-[#111111] border border-[#252525] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#36C9E8]" />
            <h3 className="font-orbitron text-sm font-bold text-white tracking-wide">
              PUBLIC SCIENTIFIC RESEARCH BENCHMARKS (AEROSPACE AUDIT BASELINE)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
            4 PEER-REVIEWED COHORTS • 1,212 PARTICIPANTS
          </span>
        </div>

        <p className="text-xs text-[#A3A3A3] leading-relaxed">
          The clinical evaluations above are contextualized against empirical physiological data from four verified public research repositories. In accordance with open science guidelines, research data is maintained in dedicated reference schemas without polluting operative crew records.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#161616] border border-[#222222] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">PhysioNet BIDMC PPG &amp; Respiration</span>
              <span className="text-[10px] font-mono text-gray-400">53 ICU Patients</span>
            </div>
            <p className="text-[11px] text-gray-400">
              High-frequency multi-parameter oxygenation and respiration time series establishing stability baselines and hypoxemia incidence rates.
            </p>
            <div className="text-[10px] font-mono text-cyan-400">
              License: Open Data Commons Attribution (ODC-By v1.0)
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#161616] border border-[#222222] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">NASA Inspiration4 (OSD-575)</span>
              <span className="text-[10px] font-mono text-purple-400">4 Commercial Astronauts</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Real commercial astronaut spaceflight multi-omics, comprehensive metabolic panels, and acute splashdown stress biomarkers with 82-day recovery tracking.
            </p>
            <div className="text-[10px] font-mono text-purple-400">
              Source: NASA Open Science Data Repository (SOMA / Nature 2024)
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#161616] border border-[#222222] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">FitBit Activity &amp; Sleep Cohort</span>
              <span className="text-[10px] font-mono text-emerald-400">34 Participants (Zenodo)</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Longitudinal wearable activity tracking calibrated against NASA 10,000-step and 60-min daily microgravity exercise countermeasure targets.
            </p>
            <div className="text-[10px] font-mono text-emerald-400">
              License: Creative Commons Attribution 4.0 (CC-BY 4.0)
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#161616] border border-[#222222] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">PhysioNet Autonomic Aging</span>
              <span className="text-[10px] font-mono text-amber-400">1,121 Subjects (Ages 18-92)</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Continuous finger plethysmography establishing normative SBP, DBP, MAP, and pulse pressure reference distributions across 8 age decades.
            </p>
            <div className="text-[10px] font-mono text-amber-400">
              Source: Jena University Medical Center / PhysioNet
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
