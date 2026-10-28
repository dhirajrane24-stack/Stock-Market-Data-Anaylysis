import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Trash2,
  Info,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { ColumnMeta, Dataset, FilterCondition } from '../types/data';
import { exportToCSV, exportToJSON } from '../utils/csvParser';

interface DataTableProps {
  dataset: Dataset;
  onUpdateDataset: (updated: Dataset) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ dataset, onUpdateDataset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [showFilterBuilder, setShowFilterBuilder] = useState(false);
  const [activeColInfo, setActiveColInfo] = useState<ColumnMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // New filter form state
  const [newCol, setNewCol] = useState(dataset.columns[0]?.key || '');
  const [newOp, setNewOp] = useState<FilterCondition['operator']>('contains');
  const [newVal, setNewVal] = useState('');

  // Filtering & Sorting
  const filteredRows = useMemo(() => {
    let rows = dataset.data;

    // 1. Search term
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      rows = rows.filter((r) =>
        dataset.columns.some((c) => {
          const val = r[c.key];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(lower);
        })
      );
    }

    // 2. Custom filters
    for (const f of filters) {
      rows = rows.filter((r) => {
        const val = r[f.column];
        if (f.operator === 'notNull') return val !== null && val !== undefined && val !== '';
        if (val === null || val === undefined) return false;

        const strVal = String(val).toLowerCase();
        const strTarget = f.value.toLowerCase();
        const numVal = Number(val);
        const numTarget = Number(f.value);

        switch (f.operator) {
          case 'equals':
            return strVal === strTarget;
          case 'contains':
            return strVal.includes(strTarget);
          case 'gt':
            return !isNaN(numVal) && !isNaN(numTarget) && numVal > numTarget;
          case 'lt':
            return !isNaN(numVal) && !isNaN(numTarget) && numVal < numTarget;
          case 'gte':
            return !isNaN(numVal) && !isNaN(numTarget) && numVal >= numTarget;
          case 'lte':
            return !isNaN(numVal) && !isNaN(numTarget) && numVal <= numTarget;
          default:
            return true;
        }
      });
    }

    // 3. Sorting
    if (sortCol) {
      const colMeta = dataset.columns.find((c) => c.key === sortCol);
      const isNum = colMeta?.type === 'number';

      rows = [...rows].sort((a, b) => {
        const va = a[sortCol];
        const vb = b[sortCol];
        if (va === vb) return 0;
        if (va === null || va === undefined) return 1;
        if (vb === null || vb === undefined) return -1;

        if (isNum) {
          return sortDirection === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va);
        }
        return sortDirection === 'asc'
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }

    return rows;
  }, [dataset.data, dataset.columns, searchTerm, filters, sortCol, sortDirection]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortCol === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else setSortCol(null);
    } else {
      setSortCol(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const addFilter = () => {
    if (!newCol) return;
    setFilters([
      ...filters,
      {
        id: `f-${Date.now()}`,
        column: newCol,
        operator: newOp,
        value: newVal,
      },
    ]);
    setNewVal('');
    setShowFilterBuilder(false);
    setCurrentPage(1);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
    setCurrentPage(1);
  };

  // Cleaning action: drop null rows
  const handleDropNullRows = () => {
    const cleaned = dataset.data.filter((row) =>
      dataset.columns.every((col) => row[col.key] !== null && row[col.key] !== undefined && row[col.key] !== '')
    );
    const updated: Dataset = {
      ...dataset,
      data: cleaned,
      totalRows: cleaned.length,
    };
    onUpdateDataset(updated);
  };

  return (
    <div className="space-y-4">
      {/* Table Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${dataset.totalRows.toLocaleString()} rows across all columns...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilterBuilder(!showFilterBuilder)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
              filters.length > 0 || showFilterBuilder
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {filters.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {filters.length}
              </span>
            )}
          </button>
        </div>

        {/* Data Actions & Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDropNullRows}
            title="Remove all rows that have any empty or missing cells"
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Drop Null Rows</span>
          </button>

          <button
            onClick={() => exportToCSV(filteredRows, `${dataset.name}-filtered.csv`)}
            className="px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Builder Panel */}
      {showFilterBuilder && (
        <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-700">Add Condition:</span>

          <select
            value={newCol}
            onChange={(e) => setNewCol(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {dataset.columns.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>

          <select
            value={newOp}
            onChange={(e) => setNewOp(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="contains">contains</option>
            <option value="equals">equals</option>
            <option value="gt">greater than (&gt;)</option>
            <option value="lt">less than (&lt;)</option>
            <option value="gte">greater than or equal (&ge;)</option>
            <option value="lte">less than or equal (&le;)</option>
            <option value="notNull">is not null</option>
          </select>

          {newOp !== 'notNull' && (
            <input
              type="text"
              placeholder="Filter value..."
              value={newVal}
              onChange={(e) => setNewVal(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}

          <button
            onClick={addFilter}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Apply Filter
          </button>
        </div>
      )}

      {/* Active Filters Display */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">Active Filters:</span>
          {filters.map((f) => (
            <span
              key={f.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-xs"
            >
              <span className="font-semibold">{f.column}</span>
              <span className="text-slate-400 font-mono text-[10px]">{f.operator}</span>
              {f.operator !== 'notNull' && <span className="font-medium text-indigo-600">"{f.value}"</span>}
              <button
                onClick={() => removeFilter(f.id)}
                className="text-slate-400 hover:text-rose-600 transition ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={() => setFilters([])}
            className="text-xs text-slate-500 hover:text-slate-800 underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-3 py-3 text-left font-semibold text-slate-400 w-12">#</th>
                {dataset.columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left font-semibold text-slate-700 select-none">
                    <div className="flex items-center justify-between gap-2">
                      <div
                        onClick={() => handleSort(col.key)}
                        className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 transition"
                      >
                        <span>{col.name}</span>
                        {sortCol === col.key ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-60 hover:opacity-100" />
                        )}
                      </div>

                      <button
                        onClick={() => setActiveColInfo(activeColInfo?.key === col.key ? null : col)}
                        title="View Column Statistics"
                        className="p-1 rounded text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={dataset.columns.length + 1} className="py-12 text-center text-slate-400">
                    No rows match the search query or active filter conditions.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => (
                  <tr key={row._id || idx} className="hover:bg-slate-50/80 transition">
                    <td className="px-3 py-2 text-slate-400 font-mono text-[10px]">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    {dataset.columns.map((col) => {
                      const val = row[col.key];
                      return (
                        <td key={col.key} className="px-4 py-2 text-slate-700 whitespace-nowrap max-w-[240px] truncate">
                          {val !== null && val !== undefined && val !== '' ? (
                            col.type === 'number' ? (
                              <span className="font-mono text-slate-900">{Number(val).toLocaleString()}</span>
                            ) : (
                              String(val)
                            )
                          ) : (
                            <span className="text-slate-300 italic text-[11px]">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Status Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold text-slate-900">{Math.min(filteredRows.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
            <span className="font-semibold text-slate-900">{Math.min(filteredRows.length, currentPage * pageSize)}</span> of{' '}
            <span className="font-semibold text-slate-900">{filteredRows.length.toLocaleString()}</span> rows
            {filteredRows.length !== dataset.totalRows && (
              <span className="text-slate-400 ml-1">(filtered from {dataset.totalRows.toLocaleString()} total)</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Column Info Modal/Drawer */}
      {activeColInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{activeColInfo.name}</h4>
                <span className="text-[11px] font-mono text-indigo-600 uppercase font-semibold">
                  Detected Type: {activeColInfo.type}
                </span>
              </div>
              <button
                onClick={() => setActiveColInfo(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-medium">Unique Values</span>
                <span className="text-base font-bold text-slate-800">{activeColInfo.uniqueCount}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-medium">Missing / Nulls</span>
                <span className="text-base font-bold text-slate-800">{activeColInfo.nullCount}</span>
              </div>

              {activeColInfo.type === 'number' && (
                <>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block font-medium">Average (Mean)</span>
                    <span className="text-sm font-bold text-slate-800">{activeColInfo.mean?.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block font-medium">Median</span>
                    <span className="text-sm font-bold text-slate-800">{activeColInfo.median?.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block font-medium">Minimum</span>
                    <span className="text-sm font-bold text-slate-800">{activeColInfo.min?.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block font-medium">Maximum</span>
                    <span className="text-sm font-bold text-slate-800">{activeColInfo.max?.toLocaleString()}</span>
                  </div>
                  <div className="col-span-2 p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block font-medium">Total Cumulative Sum</span>
                    <span className="text-base font-bold text-slate-900">{activeColInfo.sum?.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>

            {activeColInfo.distinctFrequencies && activeColInfo.distinctFrequencies.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Top Distinct Frequencies:</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {activeColInfo.distinctFrequencies.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50">
                      <span className="truncate max-w-[200px] text-slate-700 font-medium">{f.value}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{f.count} rows</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
