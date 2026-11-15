import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileUp,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Info,
  Trash2,
  Eye,
  UserCheck,
  FlaskConical
} from 'lucide-react';
import {
  astronautsApi,
  measurementsApi,
  AstronautResponse,
  HealthMeasurementCreate
} from '../../api';

interface HealthReportUploadPageProps {
  onBackToDashboard: () => void;
  onNavigateToAnalytics?: () => void;
  astronautId?: string;
}

interface ExtractedMeasurement {
  id: string;
  measuredAt: string;
  heartRate: number | null;
  spo2: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  temperature: number | null;
  pulsePressure: number | null;
  map: number | null;
  selected: boolean;
}

interface ExtractedLabResult {
  id: string;
  category: 'Complete Blood Count (CBC)' | 'Glucose Tests' | 'Lipid Profile' | 'Thyroid Profile' | 'General Chemistry';
  testName: string;
  value: string;
  unit: string;
  referenceInterval?: string;
}

// Adobe ASCII85 Decoder for ReportLab and compressed PDF streams
function decodeAscii85(a85: string): Uint8Array {
  const s = a85.replace(/<~|~>|\s/g, '');
  const out: number[] = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === 'z') {
      out.push(0, 0, 0, 0);
      i++;
      continue;
    }
    const chunk = s.slice(i, i + 5);
    i += chunk.length;
    const padding = 5 - chunk.length;
    let paddedChunk = chunk;
    for (let p = 0; p < padding; p++) {
      paddedChunk += 'u';
    }
    let val = 0;
    for (let j = 0; j < 5; j++) {
      val = val * 85 + (paddedChunk.charCodeAt(j) - 33);
    }
    const b0 = (val >>> 24) & 255;
    const b1 = (val >>> 16) & 255;
    const b2 = (val >>> 8) & 255;
    const b3 = val & 255;
    const bytes = [b0, b1, b2, b3].slice(0, 4 - padding);
    for (const b of bytes) {
      out.push(b);
    }
  }
  return new Uint8Array(out);
}

// Decompress zlib or raw deflate streams with browser DecompressionStream
async function decompressStreamBytes(bytes: Uint8Array): Promise<Uint8Array | null> {
  if (typeof DecompressionStream === 'undefined') {
    return null;
  }
  // 1. Try standard RFC 1950 zlib deflate
  try {
    const ds = new DecompressionStream('deflate');
    const writer = ds.writable.getWriter();
    writer.write(bytes as any);
    writer.close();
    const res = new Response(ds.readable);
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    // 2. Try raw deflate (stripping 2-byte header and 4-byte checksum if present)
    if (bytes.length > 6) {
      try {
        const rawBytes = bytes.slice(2, -4);
        const dsRaw = new DecompressionStream('deflate-raw');
        const writer = dsRaw.writable.getWriter();
        writer.write(rawBytes as any);
        writer.close();
        const res = new Response(dsRaw.readable);
        const buf = await res.arrayBuffer();
        return new Uint8Array(buf);
      } catch {
        // continue
      }
    }
    // 3. Try raw deflate on full bytes
    try {
      const dsRaw = new DecompressionStream('deflate-raw');
      const writer = dsRaw.writable.getWriter();
      writer.write(bytes as any);
      writer.close();
      const res = new Response(dsRaw.readable);
      const buf = await res.arrayBuffer();
      return new Uint8Array(buf);
    } catch {
      return null;
    }
  }
}

// Unescape standard PDF octal strings and escape sequences
function unescapePdfText(text: string): string {
  return text
    .replace(/\\([0-7]{1,3})/g, (_, oct) => {
      const code = parseInt(oct, 8);
      if (code === 0o226) return '–';
      if (code === 0o227) return '—';
      if (code === 0o260) return '°';
      if (code === 0o265) return 'µ';
      return String.fromCharCode(code);
    })
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}

// Extract lines of text from decompressed PDF operators, preserving table column alignment
function extractLinesFromPdfStream(streamContent: string): string[] {
  const items: { text: string; x: number; y: number }[] = [];
  let currentY = 0;
  let currentX = 0;
  let ctmY = 0;
  let ctmX = 0;

  const opRegex =
    /([0-9.\-]+)\s+([0-9.\-]+)\s+([0-9.\-]+)\s+([0-9.\-]+)\s+([0-9.\-]+)\s+([0-9.\-]+)\s+cm|([0-9.\-]+)\s+([0-9.\-]+)\s+([0-9.\-]+)\s+([0-9.\-]+)\s+([0-9.\-]+)\s+([0-9.\-]+)\s+Tm|([0-9.\-]+)\s+([0-9.\-]+)\s+Td|\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/g;

  let m: RegExpExecArray | null;
  while ((m = opRegex.exec(streamContent)) !== null) {
    if (m[1] !== undefined) {
      ctmX = parseFloat(m[5]);
      ctmY = parseFloat(m[6]);
    } else if (m[7] !== undefined) {
      currentX = ctmX + parseFloat(m[11]);
      currentY = ctmY + parseFloat(m[12]);
    } else if (m[13] !== undefined) {
      currentX += parseFloat(m[13]);
      currentY += parseFloat(m[14]);
    } else if (m[15] !== undefined) {
      items.push({ text: unescapePdfText(m[15]), x: currentX, y: currentY });
    } else if (m[16] !== undefined) {
      const strMatches = m[16].match(/\((.*?)\)/g);
      if (strMatches) {
        const t = strMatches.map(s => unescapePdfText(s.slice(1, -1))).join('');
        if (t) items.push({ text: t, x: currentX, y: currentY });
      }
    }
  }

  if (items.length === 0) {
    const simpleMatches = streamContent.match(/\((.*?)\)\s*Tj/g);
    if (simpleMatches) {
      return simpleMatches.map(s => unescapePdfText(s.replace(/^\(|\)\s*Tj$/g, '')));
    }
    return [];
  }

  // Sort descending by Y (top-to-bottom), then ascending by X (left-to-right)
  items.sort((a, b) => {
    if (Math.abs(b.y - a.y) > 2.5) return b.y - a.y;
    return a.x - b.x;
  });

  const lines: string[] = [];
  let currLine: string[] = [];
  let lastY: number | null = null;

  for (const it of items) {
    if (lastY === null || Math.abs(it.y - lastY) <= 3) {
      currLine.push(it.text);
      lastY = it.y;
    } else {
      lines.push(currLine.join('\t'));
      currLine = [it.text];
      lastY = it.y;
    }
  }
  if (currLine.length > 0) {
    lines.push(currLine.join('\t'));
  }
  return lines;
}

export const HealthReportUploadPage: React.FC<HealthReportUploadPageProps> = ({
  onBackToDashboard,
  onNavigateToAnalytics,
  astronautId: propAstronautId
}) => {
  // 1. Monitored Astronaut Context
  const [astronauts, setAstronauts] = useState<AstronautResponse[]>([]);
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>('');
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  // 2. Uploaded File State
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3. Extracted Telemetry Records & Lab Results
  const [extractedRecords, setExtractedRecords] = useState<ExtractedMeasurement[]>([]);
  const [extractedLabResults, setExtractedLabResults] = useState<ExtractedLabResult[]>([]);
  const [labOnlyNotice, setLabOnlyNotice] = useState<string | null>(null);
  const [rawTextSnippet, setRawTextSnippet] = useState<string | null>(null);

  // 4. Submission States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load Astronauts
  useEffect(() => {
    let isMounted = true;
    const loadAstronauts = async () => {
      try {
        setIsLoadingProfile(true);
        const list = await astronautsApi.list();
        if (isMounted) {
          setAstronauts(list);
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
        if (isMounted) setUploadError('Failed to connect to astronaut registry.');
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };
    loadAstronauts();
    return () => {
      isMounted = false;
    };
  }, [propAstronautId]);

  const activeAstronaut = astronauts.find(a => a.id === selectedAstronautId) || astronauts[0] || null;

  // File Selection & Validation
  const handleFileSelect = (selectedFile: File) => {
    setUploadError(null);
    setSubmitError(null);
    setSavedCount(null);
    setExtractedRecords([]);
    setRawTextSnippet(null);

    // Validate type
    const lowerName = selectedFile.name.toLowerCase();
    const isCsv = lowerName.endsWith('.csv') || selectedFile.type === 'text/csv';
    const isPdf = lowerName.endsWith('.pdf') || selectedFile.type === 'application/pdf';

    if (!isCsv && !isPdf) {
      setUploadError('Invalid file format. Please upload a CSV (.csv) or PDF (.pdf) health report.');
      return;
    }

    // Validate size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10 MB limit. Please select a smaller report.');
      return;
    }

    setFile(selectedFile);
    processFile(selectedFile, isCsv);
  };

  // Processing & Extraction Engine
  const processFile = async (inputFile: File, isCsv: boolean) => {
    setIsExtracting(true);
    setUploadError(null);
    setSubmitError(null);
    setLabOnlyNotice(null);
    setExtractedLabResults([]);

    try {
      if (isCsv) {
        const text = await inputFile.text();
        parseCsvHealthReport(text);
      } else {
        await parsePdfHealthReport(inputFile);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to extract health measurements from the uploaded document.');
    } finally {
      setIsExtracting(false);
    }
  };

  // CSV Parser (Supports both columnar telemetry series and key-value medical reports)
  const parseCsvHealthReport = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      throw new Error('CSV report must contain a header row and at least one data row.');
    }

    // Check if this CSV is a Key-Value / Clinical Report format (e.g. data_type, test_name, result, unit)
    let kvHeaderIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(',').map(s => s.trim().replace(/^["']|["']$/g, '').toLowerCase());
      if (parts.includes('test_name') && (parts.includes('result') || parts.includes('value'))) {
        kvHeaderIdx = i;
        break;
      }
    }

    if (kvHeaderIdx !== -1) {
      // Parse key-value / clinical report CSV
      let timestamp = new Date().toISOString();
      for (let i = 0; i < kvHeaderIdx; i++) {
        const parts = lines[i].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        if (parts[0].toLowerCase().includes('collected') || parts[0].toLowerCase().includes('date') || parts[0].toLowerCase().includes('time')) {
          const d = new Date(parts[1]);
          if (!isNaN(d.getTime())) timestamp = d.toISOString();
        }
      }

      let hr: number | null = null;
      let o2: number | null = null;
      let sbp: number | null = null;
      let dbp: number | null = null;
      let temp: number | null = null;
      const labs: ExtractedLabResult[] = [];

      for (let i = kvHeaderIdx + 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        if (parts.length < 3) continue;
        const category = parts[0];
        const testName = parts[1];
        const valStr = parts[2];
        const unit = parts[3] || '';
        const refRange = parts[4] || undefined;

        const nameLower = testName.toLowerCase();
        if (nameLower.includes('heart rate') || nameLower.includes('pulse')) {
          const v = parseFloat(valStr);
          if (!isNaN(v) && v >= 30 && v <= 240) hr = v;
        } else if (nameLower.includes('oxygen saturation') || nameLower.includes('spo2') || nameLower.includes('blood oxygen')) {
          const v = parseFloat(valStr);
          if (!isNaN(v) && v >= 70 && v <= 100) o2 = v;
        } else if (nameLower.includes('systolic')) {
          const v = parseInt(valStr, 10);
          if (!isNaN(v) && v >= 60 && v <= 240) sbp = v;
        } else if (nameLower.includes('diastolic')) {
          const v = parseInt(valStr, 10);
          if (!isNaN(v) && v >= 40 && v <= 140) dbp = v;
        } else if (nameLower.includes('temperature') || nameLower.includes('temp')) {
          const v = parseFloat(valStr);
          if (!isNaN(v) && v >= 34.0 && v <= 42.0) temp = v;
        } else {
          labs.push({
            id: `csv-lab-${i}`,
            category: (category.includes('CBC') ? 'Complete Blood Count (CBC)' :
                       category.includes('Glucose') ? 'Glucose Tests' :
                       category.includes('Lipid') ? 'Lipid Profile' :
                       category.includes('Thyroid') ? 'Thyroid Profile' : 'General Chemistry'),
            testName,
            value: valStr,
            unit,
            referenceInterval: refRange
          });
        }
      }

      if (sbp !== null && dbp !== null && sbp <= dbp) {
        throw new Error(
          `Invalid blood pressure in CSV: Systolic BP (${sbp} mmHg) must be greater than Diastolic BP (${dbp} mmHg).`
        );
      }

      setExtractedLabResults(labs);

      const hasVitals = hr !== null || o2 !== null || sbp !== null || temp !== null;
      if (!hasVitals && labs.length === 0) {
        throw new Error('No valid physiological measurements or laboratory findings could be extracted.');
      }

      if (!hasVitals && labs.length > 0) {
        setLabOnlyNotice(
          'Laboratory findings extracted successfully. Note: This document contains laboratory tests but no physiological vital signs (Heart Rate, SpO2, Blood Pressure, Temperature) required for the orbital vitals anomaly detection model.'
        );
        setExtractedRecords([]);
        return;
      }

      setLabOnlyNotice(null);

      let pulsePressure: number | null = null;
      let map: number | null = null;
      if (sbp !== null && dbp !== null && sbp > dbp) {
        pulsePressure = sbp - dbp;
        map = parseFloat((dbp + pulsePressure / 3).toFixed(1));
      }

      setExtractedRecords([
        {
          id: 'csv-report-1',
          measuredAt: timestamp,
          heartRate: hr,
          spo2: o2,
          systolicBp: sbp,
          diastolicBp: dbp,
          temperature: temp,
          pulsePressure,
          map,
          selected: true
        }
      ]);
      return;
    }

    // Standard columnar CSV parsing (with preamble row detection)
    let headerRowIdx = 0;
    let hrIdx = -1;
    let spo2Idx = -1;
    let sbpIdx = -1;
    let dbpIdx = -1;
    let bpCombinedIdx = -1;
    let tempIdx = -1;
    let dateIdx = -1;
    let foundHeader = false;

    for (let r = 0; r < Math.min(lines.length, 10); r++) {
      const rawHeaders = lines[r].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
      let tHr = -1, tSpo2 = -1, tSbp = -1, tDbp = -1, tBpComb = -1, tTemp = -1, tDate = -1;

      rawHeaders.forEach((header, index) => {
        if (['heart_rate', 'heart_rate_bpm', 'hr', 'pulse', 'bpm', 'heartrate'].includes(header)) {
          tHr = index;
        } else if (['spo2', 'spo2_pct', 'blood_oxygen', 'blood_oxygen_pct', 'o2_sat', 'oxygen_saturation'].includes(header)) {
          tSpo2 = index;
        } else if (['systolic', 'systolic_bp', 'systolic_bp_mmhg', 'sbp', 'sys'].includes(header)) {
          tSbp = index;
        } else if (['diastolic', 'diastolic_bp', 'diastolic_bp_mmhg', 'dbp', 'dia'].includes(header)) {
          tDbp = index;
        } else if (['blood_pressure', 'bloodpressure', 'bp'].includes(header)) {
          tBpComb = index;
        } else if (['body_temperature', 'body_temperature_celsius', 'temperature', 'temp', 'temp_c'].includes(header)) {
          tTemp = index;
        } else if (['measured_at', 'timestamp', 'date', 'datetime', 'time'].includes(header)) {
          tDate = index;
        }
      });

      if (tHr !== -1 || tSpo2 !== -1 || tSbp !== -1 || tBpComb !== -1 || tTemp !== -1) {
        headerRowIdx = r;
        hrIdx = tHr;
        spo2Idx = tSpo2;
        sbpIdx = tSbp;
        dbpIdx = tDbp;
        bpCombinedIdx = tBpComb;
        tempIdx = tTemp;
        dateIdx = tDate;
        foundHeader = true;
        break;
      }
    }

    if (!foundHeader) {
      const firstHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
      throw new Error(
        `No recognized health metrics found in CSV header: [${firstHeaders.join(', ')}]. Expected columns like Heart Rate, SpO2, Blood Pressure, or Temperature.`
      );
    }

    const records: ExtractedMeasurement[] = [];
    const nowIso = new Date().toISOString();

    for (let i = headerRowIdx + 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (row.length === 0 || row.every(val => val === '')) continue;

      let hr: number | null = null;
      let o2: number | null = null;
      let sbp: number | null = null;
      let dbp: number | null = null;
      let temp: number | null = null;
      let timestamp = nowIso;

      if (hrIdx !== -1 && row[hrIdx]) {
        const val = parseFloat(row[hrIdx]);
        if (!isNaN(val) && val >= 30 && val <= 240) hr = val;
      }

      if (spo2Idx !== -1 && row[spo2Idx]) {
        const val = parseFloat(row[spo2Idx]);
        if (!isNaN(val) && val >= 70 && val <= 100) o2 = val;
      }

      if (bpCombinedIdx !== -1 && row[bpCombinedIdx]) {
        const bpMatch = row[bpCombinedIdx].match(/(\d{2,3})\s*[\/:]\s*(\d{2,3})/);
        if (bpMatch) {
          const s = parseInt(bpMatch[1], 10);
          const d = parseInt(bpMatch[2], 10);
          if (s >= 60 && s <= 240 && d >= 40 && d <= 140) {
            sbp = s;
            dbp = d;
          }
        }
      }

      if (sbpIdx !== -1 && row[sbpIdx]) {
        const val = parseInt(row[sbpIdx], 10);
        if (!isNaN(val) && val >= 60 && val <= 240) sbp = val;
      }

      if (dbpIdx !== -1 && row[dbpIdx]) {
        const val = parseInt(row[dbpIdx], 10);
        if (!isNaN(val) && val >= 40 && val <= 140) dbp = val;
      }

      // If both SBP and DBP are present, strictly require SBP > DBP
      if (sbp !== null && dbp !== null && sbp <= dbp) {
        throw new Error(
          `Invalid blood pressure in CSV (Row ${i}): Systolic BP (${sbp} mmHg) must be greater than Diastolic BP (${dbp} mmHg).`
        );
      }

      if (tempIdx !== -1 && row[tempIdx]) {
        const val = parseFloat(row[tempIdx]);
        if (!isNaN(val) && val >= 34.0 && val <= 42.0) temp = val;
      }

      if (dateIdx !== -1 && row[dateIdx]) {
        const parsedDate = new Date(row[dateIdx]);
        if (!isNaN(parsedDate.getTime())) {
          timestamp = parsedDate.toISOString();
        }
      }

      // Calculate Derived Values
      let pulsePressure: number | null = null;
      let map: number | null = null;
      if (sbp !== null && dbp !== null && sbp > dbp) {
        pulsePressure = sbp - dbp;
        map = parseFloat((dbp + pulsePressure / 3).toFixed(1));
      }

      // Add to list if at least one vital metric was found
      if (hr !== null || o2 !== null || sbp !== null || temp !== null) {
        records.push({
          id: `csv-${i}`,
          measuredAt: timestamp,
          heartRate: hr,
          spo2: o2,
          systolicBp: sbp,
          diastolicBp: dbp,
          temperature: temp,
          pulsePressure,
          map,
          selected: true
        });
      }
    }

    if (records.length === 0) {
      throw new Error('No valid physiological measurements could be extracted from the rows.');
    }

    setExtractedRecords(records);
  };

  // PDF Parser (Client-side ASCII85/Flate decompression, line reconstruction, vitals & lab extraction)
  const parsePdfHealthReport = async (pdfFile: File) => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const latin1Text = new TextDecoder('latin1').decode(bytes);

    // Validate PDF signature
    if (!latin1Text.startsWith('%PDF-')) {
      throw new Error('The uploaded PDF file is damaged, corrupted, or not a valid PDF document.');
    }

    const decompressedStreams: string[] = [];
    let pos = 0;
    let hasImages = false;

    while (pos < latin1Text.length) {
      const sIdx = latin1Text.indexOf('stream', pos);
      if (sIdx === -1) break;

      let start = sIdx + 6;
      if (latin1Text[start] === '\r') start++;
      if (latin1Text[start] === '\n') start++;

      const eIdx = latin1Text.indexOf('endstream', start);
      if (eIdx === -1) break;

      let streamRaw = latin1Text.slice(start, eIdx);
      if (streamRaw.endsWith('\r\n')) streamRaw = streamRaw.slice(0, -2);
      else if (streamRaw.endsWith('\n')) streamRaw = streamRaw.slice(0, -1);
      else if (streamRaw.endsWith('\r')) streamRaw = streamRaw.slice(0, -1);

      const headerSlice = latin1Text.slice(Math.max(0, sIdx - 350), sIdx);
      if (headerSlice.includes('/Subtype /Image') || headerSlice.includes('/Subtype/Image')) {
        hasImages = true;
      }

      let streamBytes: Uint8Array = new Uint8Array(streamRaw.length);
      for (let b = 0; b < streamBytes.length; b++) {
        streamBytes[b] = streamRaw.charCodeAt(b);
      }

      // 1. ASCII85Decode if filtered
      if (headerSlice.includes('ASCII85Decode')) {
        streamBytes = decodeAscii85(streamRaw) as Uint8Array;
      }

      // 2. FlateDecode if compressed
      if (headerSlice.includes('FlateDecode')) {
        const decompressed = await decompressStreamBytes(streamBytes);
        if (decompressed && decompressed.length > 0) {
          decompressedStreams.push(new TextDecoder('latin1').decode(decompressed));
        }
      } else {
        decompressedStreams.push(new TextDecoder('latin1').decode(streamBytes));
      }

      pos = eIdx + 9;
    }

    // Extract text lines from all streams
    const allExtractedLines: string[] = [];
    for (const streamContent of decompressedStreams) {
      const lines = extractLinesFromPdfStream(streamContent);
      allExtractedLines.push(...lines);
    }

    const totalExtractedText = allExtractedLines.join('\n').trim();

    // Check for empty or image-only PDF
    if (!totalExtractedText || totalExtractedText.length < 15) {
      if (hasImages || latin1Text.includes('/Image') || latin1Text.includes('/XObject')) {
        throw new Error(
          'Scanned document or image-only PDF detected. Optical Character Recognition (OCR) is not currently supported. Please upload a digital PDF report with selectable text or a CSV file.'
        );
      }
      throw new Error(
        'Unable to detect readable text in this PDF document. Please verify the document text or upload a CSV report.'
      );
    }

    setRawTextSnippet(
      totalExtractedText
        .slice(0, 300)
        .replace(/[\t\r\n]+/g, ' ')
        .replace(/\s{2,}/g, ' ')
    );

    // 1. Extract Vital Signs
    let hr: number | null = null;
    const hrMatch = totalExtractedText.match(/(?:heart\s*rate|pulse|hr)[\s:=\t]+(\d{2,3})(?:\s*bpm)?/i);
    if (hrMatch) {
      const val = parseFloat(hrMatch[1]);
      if (val >= 30 && val <= 240) hr = val;
    }

    let o2: number | null = null;
    const o2Match = totalExtractedText.match(/(?:oxygen\s*saturation\s*(?:\(spo2\))?|spo2|blood\s*oxygen|o2\s*sat(?:uration)?)[\s:=\t]+(\d{2,3})\s*%?/i);
    if (o2Match) {
      const val = parseFloat(o2Match[1]);
      if (val >= 70 && val <= 100) o2 = val;
    }

    let sbp: number | null = null;
    let dbp: number | null = null;
    const bpCombinedMatch = totalExtractedText.match(/(?:blood\s*pressure|bp)[\s:=\t]+(\d{2,3})\s*[\/:]\s*(\d{2,3})/i);
    if (bpCombinedMatch) {
      const s = parseInt(bpCombinedMatch[1], 10);
      const d = parseInt(bpCombinedMatch[2], 10);
      if (s >= 60 && s <= 240 && d >= 40 && d <= 140) {
        sbp = s;
        dbp = d;
      }
    } else {
      const sbpMatch = totalExtractedText.match(/(?:systolic\s*(?:blood\s*pressure)?|sbp)[\s:=\t]+(\d{2,3})/i);
      const dbpMatch = totalExtractedText.match(/(?:diastolic\s*(?:blood\s*pressure)?|dbp)[\s:=\t]+(\d{2,3})/i);
      if (sbpMatch) {
        const val = parseInt(sbpMatch[1], 10);
        if (val >= 60 && val <= 240) sbp = val;
      }
      if (dbpMatch) {
        const val = parseInt(dbpMatch[1], 10);
        if (val >= 40 && val <= 140) dbp = val;
      }
    }

    // Blood pressure validation: if both SBP and DBP present, SBP must be > DBP
    if (sbp !== null && dbp !== null && sbp <= dbp) {
      throw new Error(
        `Invalid blood pressure in PDF: Systolic BP (${sbp} mmHg) must be greater than Diastolic BP (${dbp} mmHg).`
      );
    }

    let temp: number | null = null;
    const tempMatch = totalExtractedText.match(/(?:body\s*temperature|temperature|temp(?:erature)?)[\s:=\t]+(\d{2}(?:\.\d{1,2})?)\s*(?:°?C)?/i);
    if (tempMatch) {
      const val = parseFloat(tempMatch[1]);
      if (val >= 34.0 && val <= 42.0) temp = val;
    }

    let timestamp = new Date().toISOString();
    const dateMatch = totalExtractedText.match(/(?:collected|date|timestamp|time)[\s:=\t]+([0-9]{1,2}\s+[a-zA-Z]{3,9}\s+[0-9]{4}(?:[,\s]+[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?)?|[0-9]{4}-[0-9]{2}-[0-9]{2}(?:[T\s][0-9]{2}:[0-9]{2}:?[0-9]{0,2})?)/i);
    if (dateMatch) {
      const parsed = new Date(dateMatch[1]);
      if (!isNaN(parsed.getTime())) timestamp = parsed.toISOString();
    }

    // 2. Extract Laboratory Panels (CBC, Glucose, Lipid, Thyroid)
    const labDefinitions = [
      {
        category: 'Complete Blood Count (CBC)' as const,
        name: 'Hemoglobin',
        regex: /hemoglobin[\s:=\t]+(\d+(?:\.\d+)?)\s*([a-zA-Z\/^0-9]+)?(?:\t+(.+))?/i
      },
      {
        category: 'Complete Blood Count (CBC)' as const,
        name: 'White Blood Cells (WBC)',
        regex: /white\s*blood\s*cells\s*(?:\(wbc\))?[\s:=\t]+(\d+(?:\.\d+)?)\s*([^\s\t]+)?(?:\t+(.+))?/i
      },
      {
        category: 'Complete Blood Count (CBC)' as const,
        name: 'Red Blood Cells (RBC)',
        regex: /red\s*blood\s*cells\s*(?:\(rbc\))?[\s:=\t]+(\d+(?:\.\d+)?)\s*([^\s\t]+)?(?:\t+(.+))?/i
      },
      {
        category: 'Complete Blood Count (CBC)' as const,
        name: 'Platelets',
        regex: /platelets[\s:=\t]+(\d+(?:\.\d+)?)\s*([^\s\t]+)?(?:\t+(.+))?/i
      },
      {
        category: 'Complete Blood Count (CBC)' as const,
        name: 'Hematocrit',
        regex: /hematocrit[\s:=\t]+(\d+(?:\.\d+)?)\s*(%)?(?:\t+(.+))?/i
      },
      {
        category: 'Glucose Tests' as const,
        name: 'Fasting Glucose',
        regex: /fasting\s*glucose[\s:=\t]+(\d+(?:\.\d+)?)\s*([a-zA-Z\/]+)?(?:\t+(.+))?/i
      },
      {
        category: 'Glucose Tests' as const,
        name: 'HbA1c',
        regex: /hba1c[\s:=\t]+(\d+(?:\.\d+)?)\s*(%)?(?:\t+(.+))?/i
      },
      {
        category: 'Lipid Profile' as const,
        name: 'Total Cholesterol',
        regex: /total\s*cholesterol[\s:=\t]+(\d+(?:\.\d+)?)\s*([a-zA-Z\/]+)?(?:\t+(.+))?/i
      },
      {
        category: 'Lipid Profile' as const,
        name: 'LDL Cholesterol',
        regex: /ldl(?:\s*cholesterol)?[\s:=\t]+(\d+(?:\.\d+)?)\s*([a-zA-Z\/]+)?(?:\t+(.+))?/i
      },
      {
        category: 'Lipid Profile' as const,
        name: 'HDL Cholesterol',
        regex: /hdl(?:\s*cholesterol)?[\s:=\t]+(\d+(?:\.\d+)?)\s*([a-zA-Z\/]+)?(?:\t+(.+))?/i
      },
      {
        category: 'Lipid Profile' as const,
        name: 'Triglycerides',
        regex: /triglycerides[\s:=\t]+(\d+(?:\.\d+)?)\s*([a-zA-Z\/]+)?(?:\t+(.+))?/i
      },
      {
        category: 'Thyroid Profile' as const,
        name: 'TSH',
        regex: /tsh[\s:=\t]+(\d+(?:\.\d+)?)\s*([^\s\t]+)?(?:\t+(.+))?/i
      },
      {
        category: 'Thyroid Profile' as const,
        name: 'Free T4',
        regex: /free\s*t4[\s:=\t]+(\d+(?:\.\d+)?)\s*([^\s\t]+)?(?:\t+(.+))?/i
      },
      {
        category: 'Thyroid Profile' as const,
        name: 'Total T3',
        regex: /total\s*t3[\s:=\t]+(\d+(?:\.\d+)?)\s*([^\s\t]+)?(?:\t+(.+))?/i
      }
    ];

    const labs: ExtractedLabResult[] = [];
    for (let idx = 0; idx < labDefinitions.length; idx++) {
      const def = labDefinitions[idx];
      const match = totalExtractedText.match(def.regex);
      if (match) {
        labs.push({
          id: `lab-${idx + 1}`,
          category: def.category,
          testName: def.name,
          value: match[1],
          unit: match[2] || '',
          referenceInterval: match[3]?.trim() || undefined
        });
      }
    }

    setExtractedLabResults(labs);

    const hasVitals = hr !== null || o2 !== null || sbp !== null || temp !== null;
    const hasLabs = labs.length > 0;

    if (!hasVitals && !hasLabs) {
      throw new Error(
        'Unable to detect recognized clinical metrics (Heart Rate, SpO2, Blood Pressure, Temperature, or Laboratory Panels) in this PDF. Please verify the document text or upload a CSV report.'
      );
    }

    if (!hasVitals && hasLabs) {
      setLabOnlyNotice(
        'Laboratory findings extracted successfully. Note: This document contains laboratory tests but no physiological vital signs (Heart Rate, SpO2, Blood Pressure, Temperature) required for the orbital vitals anomaly detection model.'
      );
      setExtractedRecords([]);
      return;
    }

    setLabOnlyNotice(null);

    let pulsePressure: number | null = null;
    let map: number | null = null;
    if (sbp !== null && dbp !== null && sbp > dbp) {
      pulsePressure = sbp - dbp;
      map = parseFloat((dbp + pulsePressure / 3).toFixed(1));
    }

    setExtractedRecords([
      {
        id: 'pdf-1',
        measuredAt: timestamp,
        heartRate: hr,
        spo2: o2,
        systolicBp: sbp,
        diastolicBp: dbp,
        temperature: temp,
        pulsePressure,
        map,
        selected: true
      }
    ]);
  };

  // Toggle record selection
  const handleToggleRecord = (id: string) => {
    setExtractedRecords(prev =>
      prev.map(r => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const selectedCount = extractedRecords.filter(r => r.selected).length;

  // Save Confirmed Measurements to Backend
  const handleSaveConfirmed = async () => {
    const toSave = extractedRecords.filter(r => r.selected);
    if (toSave.length === 0) {
      setSubmitError('Please select at least one measurement record to save.');
      return;
    }

    if (!selectedAstronautId) {
      setSubmitError('Please select a target astronaut operative.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payloadList: HealthMeasurementCreate[] = toSave.map(r => ({
      astronaut_id: selectedAstronautId,
      measured_at: r.measuredAt,
      heart_rate_bpm: r.heartRate ?? undefined,
      blood_oxygen_pct: r.spo2 ?? undefined,
      systolic_bp_mmhg: r.systolicBp ?? undefined,
      diastolic_bp_mmhg: r.diastolicBp ?? undefined,
      body_temperature_celsius: r.temperature ?? undefined,
      source: 'uploaded',
      is_simulated: false
    }));

    try {
      if (measurementsApi.createBatch && payloadList.length > 1) {
        await measurementsApi.createBatch(payloadList);
      } else {
        for (const item of payloadList) {
          await measurementsApi.create(item);
        }
      }

      setSavedCount(payloadList.length);
      setExtractedRecords([]);
      setFile(null);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save uploaded health measurements to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setExtractedRecords([]);
    setExtractedLabResults([]);
    setLabOnlyNotice(null);
    setUploadError(null);
    setSubmitError(null);
    setSavedCount(null);
    setRawTextSnippet(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-space">
      {/* Top Header */}
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
              <FileUp className="w-5 h-5 text-[#36C9E8]" />
              <h1 className="font-orbitron font-bold text-lg sm:text-xl text-white tracking-wide">
                Health Report Upload
              </h1>
            </div>
          </div>
          <p className="text-xs text-[#A3A3A3] mt-1 ml-9">
            Ingest clinical health records, laboratory reports, or research series via CSV or PDF.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-[#36C9E8]/10 text-[#36C9E8] border border-[#36C9E8]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#36C9E8]" />
            Sensor-Free Ingestion • source: uploaded
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {savedCount !== null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-sm">
                Successfully Ingested {savedCount} Health {savedCount === 1 ? 'Measurement' : 'Measurements'}
              </div>
              <div className="text-xs text-emerald-400/80 font-mono mt-0.5">
                Target Operative: {activeAstronaut?.name} • Source: "uploaded" • Simulated: false
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#161616] hover:bg-[#202020] text-white border border-[#333333] transition-colors"
            >
              Upload Another
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

      {/* Error Banners */}
      {(uploadError || submitError) && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{uploadError || submitError}</span>
        </div>
      )}

      {/* Laboratory Only Informational Banner */}
      {labOnlyNotice && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-start gap-3 text-xs leading-relaxed">
          <Info className="w-5 h-5 shrink-0 text-cyan-400 mt-0.5" />
          <div>
            <div className="font-semibold text-white">Laboratory Findings Extracted Successfully</div>
            <div className="text-[11px] text-[#A3A3A3] mt-0.5">{labOnlyNotice}</div>
          </div>
        </div>
      )}

      {/* Target Astronaut Selector */}
      <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#252525] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <UserCheck className="w-4 h-4 text-[#36C9E8]" />
          <div>
            <div className="text-xs font-semibold text-white">Target Monitored Operative</div>
            <div className="text-[10px] text-[#A3A3A3]">Assign uploaded readings to this astronaut profile</div>
          </div>
        </div>

        <div className="w-full sm:w-64">
          {isLoadingProfile ? (
            <div className="h-8 rounded-lg bg-[#161616] animate-pulse border border-[#252525]" />
          ) : (
            <select
              value={selectedAstronautId}
              onChange={e => setSelectedAstronautId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#161616] border border-[#252525] text-white text-xs focus:outline-none focus:border-[#36C9E8]"
            >
              {astronauts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.crew_id || 'AST-OPS'})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* File Upload Dropzone */}
      <div
        onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden ${
          isDragging
            ? 'border-[#36C9E8] bg-[#36C9E8]/10'
            : 'border-[#2A2A2A] bg-[#0A0A0A] hover:border-[#36C9E8]/50 hover:bg-[#0D0D0D]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf,text/csv,application/pdf"
          className="hidden"
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#252525] flex items-center justify-center mx-auto text-[#36C9E8]">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <div className="font-orbitron font-semibold text-sm text-white">
              Click to browse or drop medical report here
            </div>
            <div className="text-xs text-[#888888] mt-1">
              Supports <strong className="text-white">PDF</strong> lab sheets and <strong className="text-white">CSV</strong> data series up to 10 MB.
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-[#A3A3A3]">
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              CSV Format
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              PDF Format
            </span>
          </div>
        </div>
      </div>

      {/* Selected File Information Bar */}
      {file && (
        <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#252525] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#161616] border border-[#252525] text-[#36C9E8]">
              {file.name.toLowerCase().endsWith('.csv') ? (
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              ) : (
                <FileText className="w-5 h-5 text-rose-400" />
              )}
            </div>
            <div>
              <div className="font-semibold text-xs text-white truncate max-w-xs sm:max-w-md">
                {file.name}
              </div>
              <div className="text-[10px] text-[#888888] font-mono mt-0.5">
                Format: {file.name.toLowerCase().endsWith('.csv') ? 'CSV Spreadsheet' : 'PDF Document'} • Size: {(file.size / 1024).toFixed(1)} KB
              </div>
              {rawTextSnippet && (
                <div className="text-[10px] text-[#555555] font-mono mt-1 truncate max-w-xs sm:max-w-md">
                  Extracted text preview: {rawTextSnippet}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg border border-[#252525] text-[#888888] hover:text-rose-400 hover:bg-[#161616] transition-colors"
              title="Remove File"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Extraction In-Progress Indicator */}
      {isExtracting && (
        <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#252525] text-center space-y-3">
          <div className="w-6 h-6 border-2 border-[#36C9E8] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs text-white font-medium">Extracting supported health measurements...</div>
          <div className="text-[10px] text-[#888888]">
            Scanning headers, streams, and clinical numeric parameters.
          </div>
        </div>
      )}

      {/* Extracted Measurements Preview Table */}
      {extractedRecords.length > 0 && (
        <div className="p-5 rounded-xl bg-[#0D0D0D] border border-[#252525] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E1E1E]">
            <div>
              <h3 className="font-orbitron font-semibold text-xs tracking-wider text-white uppercase flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#36C9E8]" />
                Extracted Biometric Preview ({extractedRecords.length} {extractedRecords.length === 1 ? 'Reading' : 'Readings'})
              </h3>
              <p className="text-[11px] text-[#888888] mt-0.5">
                Review extracted values before committing to the database. Missing metrics are preserved as blank.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const allSelected = extractedRecords.every(r => r.selected);
                  setExtractedRecords(prev => prev.map(r => ({ ...r, selected: !allSelected })));
                }}
                className="text-[11px] text-[#36C9E8] hover:underline"
              >
                {extractedRecords.every(r => r.selected) ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[#888888] text-[10px] font-mono uppercase">
                  <th className="py-2.5 px-3">Include</th>
                  <th className="py-2.5 px-3">Observation Time</th>
                  <th className="py-2.5 px-3">Heart Rate</th>
                  <th className="py-2.5 px-3">SpO2</th>
                  <th className="py-2.5 px-3">Blood Pressure</th>
                  <th className="py-2.5 px-3">Body Temp</th>
                  <th className="py-2.5 px-3">Pulse Pressure</th>
                  <th className="py-2.5 px-3">MAP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {extractedRecords.map(record => (
                  <tr
                    key={record.id}
                    className={`hover:bg-[#141414] transition-colors ${
                      record.selected ? 'text-white' : 'text-[#666666]'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={record.selected}
                        onChange={() => handleToggleRecord(record.id)}
                        className="rounded border-[#333333] bg-[#161616] text-[#36C9E8] focus:ring-0"
                      />
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {new Date(record.measuredAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {record.heartRate !== null ? (
                        <span className="text-white">{record.heartRate} <span className="text-[10px] text-[#888888]">BPM</span></span>
                      ) : (
                        <span className="text-[#555555]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {record.spo2 !== null ? (
                        <span className="text-[#36C9E8]">{record.spo2}%</span>
                      ) : (
                        <span className="text-[#555555]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {record.systolicBp !== null && record.diastolicBp !== null ? (
                        <span className="text-amber-400">{record.systolicBp} / {record.diastolicBp} <span className="text-[10px] text-[#888888]">mmHg</span></span>
                      ) : (
                        <span className="text-[#555555]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {record.temperature !== null ? (
                        <span className="text-emerald-400">{record.temperature}°C</span>
                      ) : (
                        <span className="text-[#555555]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {record.pulsePressure !== null ? (
                        <span>{record.pulsePressure} mmHg</span>
                      ) : (
                        <span className="text-[#555555]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {record.map !== null ? (
                        <span>{record.map} mmHg</span>
                      ) : (
                        <span className="text-[#555555]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Confirm & Save Action */}
          <div className="pt-4 border-t border-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#888888]">
              Selected for ingestion:{' '}
              <strong className="text-white font-mono">{selectedCount}</strong> of{' '}
              <strong className="text-white font-mono">{extractedRecords.length}</strong> records.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-lg border border-[#252525] text-xs text-[#A3A3A3] hover:text-white hover:bg-[#161616] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={selectedCount === 0 || isSubmitting}
                onClick={handleSaveConfirmed}
                className="px-5 py-2 rounded-lg bg-[#36C9E8] hover:bg-[#20b2d6] text-black font-semibold text-xs transition-all shadow-md shadow-[#36C9E8]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Ingesting Records...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Confirm & Ingest ({selectedCount})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Laboratory Findings Table (Isolated from 6-Feature Vitals Model) */}
      {extractedLabResults.length > 0 && (
        <div className="p-5 rounded-xl bg-[#0D0D0D] border border-[#252525] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E1E1E]">
            <div>
              <h3 className="font-orbitron font-semibold text-xs tracking-wider text-white uppercase flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-400" />
                Extracted Laboratory Findings ({extractedLabResults.length} Tests Identified)
              </h3>
              <p className="text-[11px] text-[#888888] mt-0.5">
                Clinical blood panels, biochemical analytes, and endocrine markers extracted from document.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Laboratory Audit • Not sent to vitals model
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[#888888] text-[10px] font-mono uppercase">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Test Name</th>
                  <th className="py-2.5 px-3">Measured Result</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Reference Interval / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {extractedLabResults.map(lab => (
                  <tr key={lab.id} className="hover:bg-[#141414] transition-colors text-white">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-purple-300">
                      {lab.category}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {lab.testName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-cyan-300 font-medium">
                      {lab.value}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#888888] text-[11px]">
                      {lab.unit || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-[#A3A3A3] text-[11px]">
                      {lab.referenceInterval || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-[10px] text-[#666666] italic flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            Notice: Laboratory analytes (CBC, Glucose, Lipid, Thyroid) are retained for clinical record review and physiological telemetry auditing. They are intentionally isolated from the orbital vital signs Isolation Forest model to protect baseline vector integrity.
          </div>
        </div>
      )}

      {/* Provenance and Integrity Box */}
      <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#252525] text-[11px] text-[#888888] space-y-1.5">
        <div className="flex items-center gap-1.5 text-white font-medium">
          <Info className="w-3.5 h-3.5 text-[#36C9E8]" />
          Document Extraction Standards &amp; Operational Scope
        </div>
        <p>
          Uploaded documents are processed client-side with zero telemetry fabrication. Missing columns or unreadable values are stored as null rather than imputed. All imported records are logged with <code className="text-[#36C9E8] font-mono">source="uploaded"</code> and <code className="text-[#36C9E8] font-mono">is_simulated=false</code>.
        </p>
        <p className="text-[10px] text-[#737373] italic">
          Notice: Ingested reports support mission operational readiness and physiological telemetry auditing. They do not constitute automated clinical disease diagnosis.
        </p>
      </div>
    </div>
  );
};
