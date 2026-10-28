import React, { useState, useEffect } from 'react';
import { X, BarChart3, LineChart, AreaChart, PieChart, ScatterChart as ScatterIcon, Plus, Check } from 'lucide-react';
import { AggregationType, ChartConfig, ChartType, Dataset } from '../types/data';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveChart: (chart: ChartConfig) => void;
  dataset: Dataset;
  editingChart?: ChartConfig | null;
}

const PALETTE_OPTIONS = [
  { id: 'indigo', name: 'Indigo Modern', color: '#4f46e5' },
  { id: 'emerald', name: 'Emerald Finance', color: '#059669' },
  { id: 'blue', name: 'Sapphire Tech', color: '#2563eb' },
  { id: 'amber', name: 'Amber Sunset', color: '#d97706' },
  { id: 'coral', name: 'Coral Vibrant', color: '#e11d48' },
  { id: 'violet', name: 'Violet Royale', color: '#7c3aed' },
];

export const ChartModal: React.FC<ChartModalProps> = ({
  isOpen,
  onClose,
  onSaveChart,
  dataset,
  editingChart,
}) => {
  const numericCols = dataset.columns.filter((c) => c.type === 'number');
  const allCols = dataset.columns;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ChartType>('bar');
  const [xAxis, setXAxis] = useState('');
  const [selectedYAxis, setSelectedYAxis] = useState<string[]>([]);
  const [aggregation, setAggregation] = useState<AggregationType>('sum');
  const [colorPalette, setColorPalette] = useState('indigo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('desc');

  useEffect(() => {
    if (editingChart) {
      setTitle(editingChart.title);
      setType(editingChart.type);
      setXAxis(editingChart.xAxis);
      setSelectedYAxis(editingChart.yAxis);
      setAggregation(editingChart.aggregation);
      setColorPalette(editingChart.colorPalette);
      setSortOrder(editingChart.sortOrder);
    } else {
      // Default to sensible values
      const firstNum = numericCols[0]?.key || allCols[0]?.key;
      const firstCat = allCols.find((c) => c.type === 'string' || c.type === 'date')?.key || allCols[0]?.key;
      setTitle(firstNum ? `${firstNum} Analysis` : 'New Chart');
      setType('bar');
      setXAxis(firstCat || '');
      setSelectedYAxis(firstNum ? [firstNum] : []);
      setAggregation('sum');
      setColorPalette('indigo');
      setSortOrder('desc');
    }
  }, [editingChart, dataset, isOpen]);

  if (!isOpen) return null;

  const toggleYAxis = (colKey: string) => {
    if (type === 'pie' || type === 'scatter') {
      setSelectedYAxis([colKey]);
    } else {
      if (selectedYAxis.includes(colKey)) {
        if (selectedYAxis.length > 1) {
          setSelectedYAxis(selectedYAxis.filter((k) => k !== colKey));
        }
      } else {
        setSelectedYAxis([...selectedYAxis, colKey]);
      }
    }
  };

  const handleSave = () => {
    if (!xAxis || selectedYAxis.length === 0) return;

    const chartConfig: ChartConfig = {
      id: editingChart ? editingChart.id : `chart-${Date.now()}`,
      title: title.trim() || `${selectedYAxis.join(', ')} by ${xAxis}`,
      type,
      xAxis,
      yAxis: selectedYAxis,
      aggregation,
      colorPalette,
      sortOrder,
    };

    onSaveChart(chartConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-semibold text-slate-900">
            {editingChart ? 'Edit Visualizer Chart' : 'Create Custom Visualization'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Chart Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Revenue & Profit by Product Category"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Chart Type Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Chart Type</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'bar', label: 'Bar', icon: BarChart3 },
                { id: 'line', label: 'Line', icon: LineChart },
                { id: 'area', label: 'Area', icon: AreaChart },
                { id: 'pie', label: 'Donut', icon: PieChart },
                { id: 'scatter', label: 'Scatter', icon: ScatterIcon },
              ].map((c) => {
                const Icon = c.icon;
                const isSelected = type === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setType(c.id as ChartType);
                      if (c.id === 'pie' || c.id === 'scatter') {
                        if (selectedYAxis.length > 1) setSelectedYAxis([selectedYAxis[0]]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px]">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimension (X-Axis) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Dimension (Horizontal / Category Axis)
            </label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {allCols.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Metrics (Y-Axis) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700">
                Metrics (Value / Vertical Axis)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedYAxis.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
              {numericCols.map((col) => {
                const isChecked = selectedYAxis.includes(col.key);
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => toggleYAxis(col.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                      isChecked
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                    <span>{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aggregation & Sorting */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Aggregation</label>
              <select
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value as AggregationType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="sum">Sum (Total)</option>
                <option value="avg">Average (Mean)</option>
                <option value="count">Count (Frequency)</option>
                <option value="min">Minimum</option>
                <option value="max">Maximum</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sort Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="desc">Descending (High to Low)</option>
                <option value="asc">Ascending (Low to High)</option>
                <option value="none">Original Dataset Order</option>
              </select>
            </div>
          </div>

          {/* Color Theme */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Color Palette</label>
            <div className="grid grid-cols-3 gap-2">
              {PALETTE_OPTIONS.map((pal) => (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => setColorPalette(pal.id)}
                  className={`p-2 rounded-xl border text-xs flex items-center gap-2 transition ${
                    colorPalette === pal.id
                      ? 'border-indigo-600 bg-indigo-50/50 font-semibold text-slate-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: pal.color }} />
                  <span className="truncate text-[11px]">{pal.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!xAxis || selectedYAxis.length === 0}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {editingChart ? 'Update Chart' : 'Add to Visualizer'}
          </button>
        </div>
      </div>
    </div>
  );
};
