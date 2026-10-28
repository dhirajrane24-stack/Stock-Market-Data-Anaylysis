import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';
import { Maximize2, Trash2, Edit3, Layers } from 'lucide-react';
import { ChartConfig, ColumnMeta, Dataset } from '../types/data';
import { aggregateDataForChart } from '../utils/dataAnalysis';

interface ChartCardProps {
  config: ChartConfig;
  dataset: Dataset;
  onEdit?: (config: ChartConfig) => void;
  onDelete?: (id: string) => void;
  isReadOnly?: boolean;
}

const PALETTES: Record<string, string[]> = {
  indigo: ['#4f46e5', '#818cf8', '#c7d2fe', '#312e81', '#6366f1'],
  emerald: ['#059669', '#34d399', '#a7f3d0', '#065f46', '#10b981'],
  blue: ['#2563eb', '#60a5fa', '#bfdbfe', '#1e40af', '#3b82f6'],
  amber: ['#d97706', '#fbbf24', '#fef3c7', '#92400e', '#f59e0b'],
  coral: ['#e11d48', '#fb7185', '#fecdd3', '#9f1239', '#f43f5e'],
  violet: ['#7c3aed', '#a78bfa', '#ddd6fe', '#4c1d95', '#8b5cf6'],
};

export const ChartCard: React.FC<ChartCardProps> = ({
  config,
  dataset,
  onEdit,
  onDelete,
  isReadOnly = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStacked, setIsStacked] = useState(config.isStacked || false);

  const colors = PALETTES[config.colorPalette] || PALETTES.indigo;
  const chartData = aggregateDataForChart(dataset.data, config, dataset.columns);

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-xs text-slate-400">
          No data available for the selected axes.
        </div>
      );
    }

    if (config.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey={config.xAxis}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              angle={-25}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
              formatter={(val: any) => [Number(val).toLocaleString(), '']}
            />
            {config.yAxis.length > 1 && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />}
            {config.yAxis.map((yKey, idx) => (
              <Bar
                key={yKey}
                dataKey={yKey}
                stackId={isStacked ? 'stack' : undefined}
                fill={colors[idx % colors.length]}
                radius={isStacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (config.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey={config.xAxis}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              angle={-25}
              textAnchor="end"
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
              formatter={(val: any) => [Number(val).toLocaleString(), '']}
            />
            {config.yAxis.length > 1 && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />}
            {config.yAxis.map((yKey, idx) => (
              <Line
                key={yKey}
                type="monotone"
                dataKey={yKey}
                stroke={colors[idx % colors.length]}
                strokeWidth={2.5}
                dot={{ r: 3, fill: colors[idx % colors.length] }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (config.type === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
            <defs>
              {config.yAxis.map((yKey, idx) => (
                <linearGradient key={yKey} id={`grad-${config.id}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0.0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey={config.xAxis}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              angle={-25}
              textAnchor="end"
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
              formatter={(val: any) => [Number(val).toLocaleString(), '']}
            />
            {config.yAxis.length > 1 && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />}
            {config.yAxis.map((yKey, idx) => (
              <Area
                key={yKey}
                type="monotone"
                dataKey={yKey}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#grad-${config.id}-${idx})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (config.type === 'pie') {
      const primaryMetric = config.yAxis[0];
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData.slice(0, 8)}
              dataKey={primaryMetric}
              nameKey={config.xAxis}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
            >
              {chartData.slice(0, 8).map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
              formatter={(val: any) => [Number(val).toLocaleString(), '']}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (config.type === 'scatter') {
      const yMetric = config.yAxis[0];
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey={config.xAxis}
              name={config.xAxis}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              dataKey={yMetric}
              name={yMetric}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            />
            <Scatter name="Records" data={chartData} fill={colors[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition break-inside-avoid">
      {/* Chart Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 tracking-tight">{config.title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {config.aggregation.toUpperCase()} of {config.yAxis.join(', ')} by {config.xAxis}
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-1">
            {config.type === 'bar' && config.yAxis.length > 1 && (
              <button
                onClick={() => setIsStacked(!isStacked)}
                title="Toggle Stacked Mode"
                className={`p-1.5 rounded-lg border text-xs transition ${
                  isStacked ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => setIsFullscreen(true)}
              title="Fullscreen View"
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {onEdit && (
              <button
                onClick={() => onEdit(config)}
                title="Edit Chart"
                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(config.id)}
                title="Remove Chart"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div className="h-64 w-full mt-2">
        {renderChart()}
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-5xl w-full h-[80vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{config.title}</h3>
                <p className="text-xs text-slate-500">
                  {config.aggregation.toUpperCase()} of {config.yAxis.join(', ')} grouped by {config.xAxis}
                </p>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close Fullscreen
              </button>
            </div>
            <div className="flex-1 mt-4">
              {renderChart()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
