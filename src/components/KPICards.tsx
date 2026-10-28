import React from 'react';
import { Layers, Database, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { Dataset } from '../types/data';

interface KPICardsProps {
  dataset: Dataset;
}

export const KPICards: React.FC<KPICardsProps> = ({ dataset }) => {
  const numericCols = dataset.columns.filter((c) => c.type === 'number');
  const catCols = dataset.columns.filter((c) => c.type === 'string');
  const dateCols = dataset.columns.filter((c) => c.type === 'date');

  // Compute completeness
  const totalCells = dataset.totalRows * dataset.columns.length;
  const totalNulls = dataset.columns.reduce((acc, c) => acc + c.nullCount, 0);
  const completeness = totalCells > 0 ? Math.round(((totalCells - totalNulls) / totalCells) * 100) : 100;

  // Primary metric
  const primaryMetric = numericCols.length > 0 ? numericCols[0] : null;
  const secondaryMetric = numericCols.length > 1 ? numericCols[1] : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Total Records */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Records</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {dataset.totalRows.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Across {dataset.columns.length} columns ({dataset.columns.length} fields)
          </p>
        </div>
      </div>

      {/* KPI 2: Schema Composition */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Schema Breakdown</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {dataset.columns.length} Fields
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {numericCols.length} Numeric · {catCols.length} Text · {dateCols.length} Date
          </p>
        </div>
      </div>

      {/* KPI 3: Primary Numeric Metric */}
      {primaryMetric ? (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate max-w-[150px]">
              {primaryMetric.name} Total
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {primaryMetric.sum !== undefined ? primaryMetric.sum.toLocaleString() : 'N/A'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Avg: {primaryMetric.mean !== undefined ? primaryMetric.mean.toLocaleString() : 'N/A'} · Max: {primaryMetric.max !== undefined ? primaryMetric.max.toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Category</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight truncate">
              {catCols[0]?.distinctFrequencies?.[0]?.value || 'Categorical'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {catCols[0]?.distinctFrequencies?.[0]?.count || 0} occurrences
            </p>
          </div>
        </div>
      )}

      {/* KPI 4: Data Quality & Completeness */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Completeness</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            completeness >= 95 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {completeness >= 95 ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {completeness}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {totalNulls === 0 ? 'Zero missing values detected' : `${totalNulls} null/missing cells`}
          </p>
        </div>
      </div>
    </div>
  );
};
