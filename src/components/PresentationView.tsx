import React from 'react';
import { ArrowLeft, Printer, Download, Sparkles, Database } from 'lucide-react';
import { ChartConfig, Dataset } from '../types/data';
import { ChartCard } from './ChartCard';
import { KPICards } from './KPICards';
import { generateAutomatedInsights } from '../utils/dataAnalysis';
import { exportToCSV } from '../utils/csvParser';

interface PresentationViewProps {
  dataset: Dataset;
  charts: ChartConfig[];
  onExit: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({
  dataset,
  charts,
  onExit,
}) => {
  const insights = generateAutomatedInsights(dataset);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Control Bar (Hidden when printed) */}
        <div className="flex items-center justify-between no-print border-b border-slate-800 pb-4">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Presentation Mode</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Executive Summary</span>
            </button>
            <button
              onClick={() => exportToCSV(dataset.data, `${dataset.name}-export.csv`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Dataset</span>
            </button>
          </div>
        </div>

        {/* Executive Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
              Live Executive Dashboard
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {dataset.name}
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Synthesizing {dataset.totalRows.toLocaleString()} transaction records across {dataset.columns.length} attributes. Generated on {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}.
          </p>
        </div>

        {/* KPIs in Dark/Presentation Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Rows</span>
            <div className="text-2xl font-bold text-white mt-2">{dataset.totalRows.toLocaleString()}</div>
            <span className="text-xs text-slate-400 mt-1 block">Full Population</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Columns</span>
            <div className="text-2xl font-bold text-white mt-2">{dataset.columns.length} Fields</div>
            <span className="text-xs text-slate-400 mt-1 block">{dataset.columns.filter(c => c.type === 'number').length} Numeric Metrics</span>
          </div>

          {dataset.columns.find(c => c.type === 'number') && (
            <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate block">
                {dataset.columns.find(c => c.type === 'number')?.name} Total
              </span>
              <div className="text-2xl font-bold text-emerald-400 mt-2">
                {dataset.columns.find(c => c.type === 'number')?.sum?.toLocaleString() || 'N/A'}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Avg: {dataset.columns.find(c => c.type === 'number')?.mean?.toLocaleString() || 'N/A'}
              </span>
            </div>
          )}

          <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completeness</span>
            <div className="text-2xl font-bold text-indigo-400 mt-2">
              {Math.round(((dataset.totalRows * dataset.columns.length - dataset.columns.reduce((a, b) => a + b.nullCount, 0)) / (dataset.totalRows * dataset.columns.length)) * 100)}%
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Verified Clean Data</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Key Visualizations</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.map((chart) => (
              <ChartCard
                key={chart.id}
                config={chart}
                dataset={dataset}
                isReadOnly={true}
              />
            ))}
          </div>
        </div>

        {/* AI Key Insights */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Key Executive Observations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins) => (
              <div key={ins.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/40">
                <h4 className="text-xs font-semibold text-indigo-300">{ins.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ins.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
