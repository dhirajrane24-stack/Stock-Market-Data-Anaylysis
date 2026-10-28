export type DataType = 'number' | 'string' | 'date' | 'boolean';

export interface ColumnMeta {
  name: string;
  key: string;
  type: DataType;
  sampleValues: (string | number | boolean | null)[];
  uniqueCount: number;
  nullCount: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  sum?: number;
  stdDev?: number;
  distinctFrequencies?: { value: string; count: number }[];
}

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';
export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'scatter';

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  xAxis: string;
  yAxis: string[];
  aggregation: AggregationType;
  colorPalette: string;
  sortOrder: 'asc' | 'desc' | 'none';
  isStacked?: boolean;
  description?: string;
}

export interface FilterCondition {
  id: string;
  column: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'notNull';
  value: string;
}

export interface Dataset {
  id: string;
  name: string;
  fileName: string;
  sizeBytes: number;
  uploadedAt: string;
  columns: ColumnMeta[];
  data: Record<string, any>[];
  totalRows: number;
  rawText?: string;
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'summary';
  title: string;
  description: string;
  metric?: string;
  confidence: number;
}

export interface PublishedDashboard {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  datasetName: string;
  totalRows: number;
  totalColumns: number;
  charts: ChartConfig[];
  kpis: { title: string; value: string | number; change?: string; subtitle?: string }[];
  insights: AIInsight[];
  dataSnippet: Record<string, any>[];
  columns: ColumnMeta[];
}
