import React from 'react';
import {
  BarChart3,
  Table,
  LineChart,
  Sparkles,
  Share2,
  Upload,
  Database,
  ChevronDown,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { Dataset } from '../types/data';

interface NavbarProps {
  activeTab: 'dashboard' | 'table' | 'visualizer' | 'insights' | 'publish';
  setActiveTab: (tab: 'dashboard' | 'table' | 'visualizer' | 'insights' | 'publish') => void;
  dataset: Dataset | null;
  onOpenUpload: () => void;
  onOpenPublish: () => void;
  onEnterPresentation: () => void;
  datasetsList: Dataset[];
  onSelectDataset: (d: Dataset) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  dataset,
  onOpenUpload,
  onOpenPublish,
  onEnterPresentation,
  datasetsList,
  onSelectDataset,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Dataset Selector */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
                  DataStudio <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">CSV</span>
                </span>
              </div>
            </div>

            {/* Active Dataset Dropdown */}
            {dataset && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="max-w-[150px] truncate">{dataset.name}</span>
                  <span className="text-slate-600 font-mono text-[10px]">({dataset.totalRows} rows)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 mt-1 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-40">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Active Datasets ({datasetsList.length})
                    </div>
                    {datasetsList.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          onSelectDataset(d);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                          d.id === dataset.id ? 'bg-indigo-50/60 font-semibold text-indigo-700' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <p className="truncate">{d.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{d.columns.length} cols · {d.totalRows} rows</span>
                        </div>
                        {d.id === dataset.id && <span className="text-indigo-600 text-[10px]">Active</span>}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1 px-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenUpload();
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-2 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload another CSV...
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'table'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Data & Clean</span>
            </button>

            <button
              onClick={() => setActiveTab('visualizer')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'visualizer'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>Visualizer</span>
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'insights'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Insights</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {dataset && (
              <button
                onClick={onEnterPresentation}
                title="Presentation View"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Present</span>
              </button>
            )}

            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload CSV</span>
            </button>

            <button
              onClick={onOpenPublish}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
