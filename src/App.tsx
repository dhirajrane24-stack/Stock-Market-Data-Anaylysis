import React, { useState, useEffect } from 'react';
import {
  Upload,
  Plus,
  BarChart3,
  Table,
  LineChart,
  Sparkles,
  Share2,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Download,
  CheckCircle2,
  HelpCircle,
  Eye
} from 'lucide-react';
import { ChartConfig, Dataset } from './types/data';
import { SAMPLE_DATASETS } from './utils/sampleDatasets';
import { parseCSVContent } from './utils/csvParser';
import { generateDefaultCharts } from './utils/dataAnalysis';
import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { DataTable } from './components/DataTable';
import { ChartCard } from './components/ChartCard';
import { ChartModal } from './components/ChartModal';
import { UploadModal } from './components/UploadModal';
import { AIInsightsView } from './components/AIInsightsView';
import { PublishModal } from './components/PublishModal';
import { PresentationView } from './components/PresentationView';

export default function App() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [currentDatasetId, setCurrentDatasetId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'visualizer' | 'insights' | 'publish'>('dashboard');

  // Modals & View States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Charts mapped by dataset ID
  const [chartsByDataset, setChartsByDataset] = useState<Record<string, ChartConfig[]>>({});

  // Initialize with the first sample dataset so there's never a blank screen
  useEffect(() => {
    const defaultSample = SAMPLE_DATASETS[0];
    const { dataset } = parseCSVContent(defaultSample.csvContent, `${defaultSample.name}.csv`);
    if (dataset) {
      setDatasets([dataset]);
      setCurrentDatasetId(dataset.id);
      const initialCharts = generateDefaultCharts(dataset);
      setChartsByDataset({ [dataset.id]: initialCharts });
    }
  }, []);

  const currentDataset = datasets.find((d) => d.id === currentDatasetId) || datasets[0] || null;
  const currentCharts = currentDataset ? chartsByDataset[currentDataset.id] || [] : [];

  const handleDatasetLoaded = (newDataset: Dataset) => {
    setDatasets((prev) => [newDataset, ...prev.filter((d) => d.id !== newDataset.id)]);
    setCurrentDatasetId(newDataset.id);
    const initialCharts = generateDefaultCharts(newDataset);
    setChartsByDataset((prev) => ({
      ...prev,
      [newDataset.id]: initialCharts,
    }));
    setActiveTab('dashboard');
  };

  const handleUpdateDataset = (updated: Dataset) => {
    setDatasets((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleSaveChart = (chart: ChartConfig) => {
    if (!currentDataset) return;
    const existing = currentCharts;
    const isEdit = existing.some((c) => c.id === chart.id);
    const updated = isEdit
      ? existing.map((c) => (c.id === chart.id ? chart : c))
      : [chart, ...existing];

    setChartsByDataset((prev) => ({
      ...prev,
      [currentDataset.id]: updated,
    }));
  };

  const handleDeleteChart = (chartId: string) => {
    if (!currentDataset) return;
    setChartsByDataset((prev) => ({
      ...prev,
      [currentDataset.id]: currentCharts.filter((c) => c.id !== chartId),
    }));
  };

  // If in Presentation Mode, render full-screen presentation view
  if (isPresentationMode && currentDataset) {
    return (
      <PresentationView
        dataset={currentDataset}
        charts={currentCharts}
        onExit={() => setIsPresentationMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dataset={currentDataset}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenPublish={() => setIsPublishOpen(true)}
        onEnterPresentation={() => setIsPresentationMode(true)}
        datasetsList={datasets}
        onSelectDataset={(d) => setCurrentDatasetId(d.id)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentDataset ? (
          <div className="space-y-6">
            {/* TAB 1: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Header Welcome Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        Active Dataset
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {currentDataset.fileName}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                      {currentDataset.name}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Uploaded on {new Date(currentDataset.uploadedAt).toLocaleDateString()} · {currentDataset.totalRows.toLocaleString()} total rows · {currentDataset.columns.length} columns detected
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsChartModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Visualization</span>
                    </button>

                    <button
                      onClick={() => setIsPublishOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Publish Dashboard</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Strip */}
                <KPICards dataset={currentDataset} />

                {/* Visualizations Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                        Interactive Visualizations ({currentCharts.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Configured charts visualizing key distributions, aggregations, and trends
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingChart(null);
                        setIsChartModalOpen(true);
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Chart</span>
                    </button>
                  </div>

                  {currentCharts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                      <BarChart3 className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500">No visualizations added yet.</p>
                      <button
                        onClick={() => setIsChartModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Visualization</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {currentCharts.map((chart) => (
                        <ChartCard
                          key={chart.id}
                          config={chart}
                          dataset={currentDataset}
                          onEdit={(c) => {
                            setEditingChart(c);
                            setIsChartModalOpen(true);
                          }}
                          onDelete={handleDeleteChart}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Data Sample Strip */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Quick Data Sample
                      </h4>
                      <p className="text-xs text-slate-500">
                        Preview of the first 5 records in {currentDataset.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('table')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Explore full data table</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="min-w-full divide-y divide-slate-100 text-xs">
                      <thead className="bg-slate-50/80">
                        <tr>
                          {currentDataset.columns.slice(0, 7).map((c) => (
                            <th key={c.key} className="px-3.5 py-2.5 text-left font-semibold text-slate-700">
                              {c.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 bg-white">
                        {currentDataset.data.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            {currentDataset.columns.slice(0, 7).map((c) => (
                              <td key={c.key} className="px-3.5 py-2 text-slate-600 truncate max-w-[180px]">
                                {row[c.key] !== null ? String(row[c.key]) : '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DATA TABLE & CLEANING */}
            {activeTab === 'table' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Table & Cleaning</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Search, filter, inspect column distributions, drop nulls, and export datasets.
                  </p>
                </div>

                <DataTable
                  dataset={currentDataset}
                  onUpdateDataset={handleUpdateDataset}
                />
              </div>
            )}

            {/* TAB 3: VISUALIZER STUDIO */}
            {activeTab === 'visualizer' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Visualizer Studio</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Craft custom Bar, Line, Area, Donut, and Scatter visualizations from your dataset.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingChart(null);
                      setIsChartModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Custom Chart</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {currentCharts.map((chart) => (
                    <ChartCard
                      key={chart.id}
                      config={chart}
                      dataset={currentDataset}
                      onEdit={(c) => {
                        setEditingChart(c);
                        setIsChartModalOpen(true);
                      }}
                      onDelete={handleDeleteChart}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: AI INSIGHTS & CHAT */}
            {activeTab === 'insights' && (
              <AIInsightsView dataset={currentDataset} />
            )}

            {/* TAB 5: PUBLISH & EXPORT */}
            {activeTab === 'publish' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                      <Share2 className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Publishing Center</h2>
                      <p className="text-xs text-slate-500">
                        Publish your dashboard to the web, launch executive presentation mode, or export files.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                    <button
                      onClick={() => setIsPublishOpen(true)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Open Publishing Dialog</span>
                    </button>

                    <button
                      onClick={() => setIsPresentationMode(true)}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Launch Presentation Mode</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State if no dataset */
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-xl mx-auto space-y-4 my-12 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">No Dataset Loaded</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Upload a CSV, TSV, or spreadsheet data file to generate instant analytics, charts, and AI insights.
              </p>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload CSV Dataset</span>
            </button>
          </div>
        )}
      </main>

      {/* Upload CSV Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDatasetLoaded={handleDatasetLoaded}
      />

      {/* Publish & Share Modal */}
      {currentDataset && (
        <PublishModal
          isOpen={isPublishOpen}
          onClose={() => setIsPublishOpen(false)}
          dataset={currentDataset}
          charts={currentCharts}
          onEnterPresentation={() => setIsPresentationMode(true)}
        />
      )}

      {/* Create / Edit Visualization Modal */}
      {currentDataset && (
        <ChartModal
          isOpen={isChartModalOpen}
          onClose={() => {
            setIsChartModalOpen(false);
            setEditingChart(null);
          }}
          onSaveChart={handleSaveChart}
          dataset={currentDataset}
          editingChart={editingChart}
        />
      )}
    </div>
  );
}
