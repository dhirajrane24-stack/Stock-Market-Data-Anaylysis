import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { parseCSVContent } from '../utils/csvParser';
import { SAMPLE_DATASETS } from '../utils/sampleDatasets';
import { Dataset } from '../types/data';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (dataset: Dataset) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDatasetLoaded,
}) => {
  const [tab, setTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [datasetName, setDatasetName] = useState('Pasted Dataset');
  const [delimiter, setDelimiter] = useState<string>(''); // empty means auto
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewDataset, setPreviewDataset] = useState<Dataset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    setErrorMsg(null);
    setPreviewDataset(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setErrorMsg('The selected file appears to be empty.');
        return;
      }

      const { dataset, error } = parseCSVContent(text, file.name, delimiter || undefined);
      if (error || !dataset) {
        setErrorMsg(error || 'Failed to parse CSV file.');
      } else {
        setPreviewDataset(dataset);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error reading the file from disk.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handlePasteProcess = () => {
    if (!pastedText.trim()) {
      setErrorMsg('Please paste some CSV or tabular data first.');
      return;
    }

    const { dataset, error } = parseCSVContent(
      pastedText,
      datasetName.endsWith('.csv') ? datasetName : `${datasetName}.csv`,
      delimiter || undefined
    );

    if (error || !dataset) {
      setErrorMsg(error || 'Failed to parse pasted data.');
    } else {
      setPreviewDataset(dataset);
    }
  };

  const handleLoadSample = (sample: (typeof SAMPLE_DATASETS)[0]) => {
    setErrorMsg(null);
    const { dataset, error } = parseCSVContent(sample.csvContent, `${sample.name}.csv`);
    if (dataset) {
      onDatasetLoaded(dataset);
      onClose();
    } else {
      setErrorMsg(error || 'Failed to load sample dataset.');
    }
  };

  const handleConfirmDataset = () => {
    if (previewDataset) {
      onDatasetLoaded(previewDataset);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Upload CSV Dataset</h3>
              <p className="text-xs text-slate-500">Import structured tabular data for instant analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-100">
          <button
            onClick={() => {
              setTab('upload');
              setErrorMsg(null);
            }}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
              tab === 'upload'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => {
              setTab('paste');
              setErrorMsg(null);
            }}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
              tab === 'paste'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Paste Raw CSV
          </button>
          <button
            onClick={() => {
              setTab('samples');
              setErrorMsg(null);
            }}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
              tab === 'samples'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Sample Datasets</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
              <div>
                <p className="font-semibold">Upload Notice</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* TAB 1: File Upload */}
          {tab === 'upload' && !previewDataset && (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100/70 text-indigo-600 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Click to browse or drag and drop your CSV file here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports standard CSV, TSV, or tab-delimited text files (up to 50MB)
                </p>
              </div>

              {/* Delimiter Settings */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-medium">Delimiter Setting:</span>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Auto-Detect (Recommended)</option>
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="&#9;">Tab (\t)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: Paste Raw CSV */}
          {tab === 'paste' && !previewDataset && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Dataset Name</label>
                <input
                  type="text"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Sales Q3 Report"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Paste Tabular Data (CSV, TSV, or Excel copy-paste)
                </label>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`Date,Category,Revenue,Profit\n2024-01-01,Electronics,12000,3400\n2024-01-02,Office,4500,1200`}
                  className="w-full font-mono text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/30"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePasteProcess}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Parse Data
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Sample Datasets */}
          {tab === 'samples' && !previewDataset && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_DATASETS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleLoadSample(sample)}
                  className="p-3.5 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-xl cursor-pointer transition text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-indigo-600 tracking-wide uppercase">
                      {sample.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{sample.rowCount} rows</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 mt-1 group-hover:text-indigo-600 transition">
                    {sample.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sample.description}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-600">
                    <span>Load Dataset</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PREVIEW OF PARSED DATA */}
          {previewDataset && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-900">
                      Successfully Parsed: {previewDataset.name}
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      {previewDataset.totalRows.toLocaleString()} rows detected across {previewDataset.columns.length} columns.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewDataset(null)}
                  className="text-xs font-medium text-emerald-800 underline hover:text-emerald-950"
                >
                  Choose another
                </button>
              </div>

              {/* Columns Detected Preview */}
              <div>
                <p className="text-xs font-medium text-slate-700 mb-2">Detected Column Schema:</p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {previewDataset.columns.map((col) => (
                    <span
                      key={col.key}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-white border border-slate-200 text-slate-700"
                    >
                      <span className="font-medium">{col.name}</span>
                      <span className="text-[9px] text-slate-600 uppercase font-mono">({col.type})</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Rows Sample Preview Table */}
              <div>
                <p className="text-xs font-medium text-slate-700 mb-2">Data Sample (First 3 Rows):</p>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        {previewDataset.columns.slice(0, 6).map((c) => (
                          <th key={c.key} className="px-3 py-2 text-left font-semibold text-slate-700 truncate">
                            {c.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {previewDataset.data.slice(0, 3).map((row, i) => (
                        <tr key={i}>
                          {previewDataset.columns.slice(0, 6).map((c) => (
                            <td key={c.key} className="px-3 py-1.5 text-slate-600 truncate max-w-[120px]">
                              {row[c.key] !== null ? String(row[c.key]) : <span className="text-slate-300 italic">null</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setPreviewDataset(null)}
                  className="px-4 py-2 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDataset}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <span>Open & Analyze Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
