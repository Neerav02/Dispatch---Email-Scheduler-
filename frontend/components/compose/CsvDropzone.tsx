'use client';

import { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface CsvDropzoneProps {
  onParsed: (validEmails: string[], invalidEmails: string[]) => void;
}

export default function CsvDropzone({ onParsed }: CsvDropzoneProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [validEmails, setValidEmails] = useState<string[]>([]);
  const [invalidEmails, setInvalidEmails] = useState<string[]>([]);
  const [showInvalid, setShowInvalid] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/[\r\n]+/);
      const valid: string[] = [];
      const invalid: string[] = [];

      lines.forEach((line) => {
        const raw = line.split(',')[0]?.trim();
        if (!raw || raw.toLowerCase() === 'email' || raw.toLowerCase() === 'recipient') return;

        if (validateEmail(raw)) {
          if (!valid.includes(raw)) valid.push(raw);
        } else {
          invalid.push(raw);
        }
      });

      setValidEmails(valid);
      setInvalidEmails(invalid);
      onParsed(valid, invalid);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center bg-slate-50 hover:bg-indigo-50/40 transition-colors cursor-pointer"
      >
        <input
          type="file"
          accept=".csv,.txt"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 rounded-full bg-white border border-slate-200 text-indigo-600 shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">
              {fileName ? fileName : 'Drop your CSV file here, or click to browse'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Supports CSV with email column or plain recipient text list
            </p>
          </div>
        </div>
      </div>

      {/* Parse Feedback Stats */}
      {validEmails.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Parsed {validEmails.length} valid recipient emails</span>
          </div>
          <span className="font-mono text-emerald-700 font-bold">READY</span>
        </div>
      )}

      {invalidEmails.length > 0 && (
        <div className="border border-amber-200 rounded-xl bg-amber-50 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setShowInvalid(!showInvalid)}
            className="w-full p-3 flex items-center justify-between text-amber-800 font-semibold text-left"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              {invalidEmails.length} malformed lines ignored
            </span>
            {showInvalid ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showInvalid && (
            <div className="p-3 bg-amber-100/60 border-t border-amber-200 font-mono text-[11px] space-y-1 text-amber-900 max-h-32 overflow-y-auto">
              {invalidEmails.map((item, idx) => (
                <div key={idx} className="truncate">• {item}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
