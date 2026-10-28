import Papa from 'papaparse';
import { ColumnMeta, DataType, Dataset } from '../types/data';

/**
 * Clean and detect the data type of a column based on non-empty values
 */
export function inferColumnType(values: any[]): DataType {
  let numberCount = 0;
  let dateCount = 0;
  let booleanCount = 0;
  let validCount = 0;

  for (const v of values) {
    if (v === null || v === undefined || v === '') continue;
    validCount++;

    const str = String(v).trim();

    // Check boolean
    if (str.toLowerCase() === 'true' || str.toLowerCase() === 'false' || str.toLowerCase() === 'yes' || str.toLowerCase() === 'no') {
      booleanCount++;
      continue;
    }

    // Check number (strip optional currency symbols, commas, percent signs)
    const cleanedNum = str.replace(/^[$\u20AC\u00A3\u00A5]/, '').replace(/%$/, '').replace(/,/g, '').trim();
    if (cleanedNum !== '' && !isNaN(Number(cleanedNum))) {
      numberCount++;
      continue;
    }

    // Check date
    if (str.length >= 6 && !isNaN(Date.parse(str)) && (str.includes('-') || str.includes('/') || str.includes('.'))) {
      dateCount++;
    }
  }

  if (validCount === 0) return 'string';
  if (numberCount / validCount > 0.75) return 'number';
  if (booleanCount / validCount > 0.8) return 'boolean';
  if (dateCount / validCount > 0.7) return 'date';
  return 'string';
}

/**
 * Clean and parse row values according to inferred or detected column types
 */
export function castValue(val: any, type: DataType): any {
  if (val === null || val === undefined || val === '') return null;
  const str = String(val).trim();

  if (type === 'number') {
    const cleanedNum = str.replace(/^[$\u20AC\u00A3\u00A5]/, '').replace(/%$/, '').replace(/,/g, '').trim();
    const parsed = Number(cleanedNum);
    return isNaN(parsed) ? null : parsed;
  }

  if (type === 'boolean') {
    const lower = str.toLowerCase();
    if (lower === 'true' || lower === 'yes' || lower === '1') return true;
    if (lower === 'false' || lower === 'no' || lower === '0') return false;
    return null;
  }

  return str;
}

/**
 * Computes statistical metadata for a given column
 */
export function computeColumnMeta(key: string, rawValues: any[], type: DataType): ColumnMeta {
  const cleanValues = rawValues.map((v) => castValue(v, type));
  const nonNullValues = cleanValues.filter((v) => v !== null && v !== undefined && v !== '');

  const nullCount = cleanValues.length - nonNullValues.length;
  const uniqueSet = new Set(nonNullValues.map(String));
  const uniqueCount = uniqueSet.size;

  // Frequencies of top distinct values
  const freqMap: Record<string, number> = {};
  for (const val of nonNullValues) {
    const k = String(val);
    freqMap[k] = (freqMap[k] || 0) + 1;
  }
  const distinctFrequencies = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([value, count]) => ({ value, count }));

  const meta: ColumnMeta = {
    name: key,
    key,
    type,
    sampleValues: nonNullValues.slice(0, 5),
    uniqueCount,
    nullCount,
    distinctFrequencies,
  };

  if (type === 'number' && nonNullValues.length > 0) {
    const nums = nonNullValues.map(Number).filter((n) => !isNaN(n)).sort((a, b) => a - b);
    if (nums.length > 0) {
      const sum = nums.reduce((acc, curr) => acc + curr, 0);
      const mean = sum / nums.length;
      const min = nums[0];
      const max = nums[nums.length - 1];
      const median =
        nums.length % 2 === 0
          ? (nums[nums.length / 2 - 1] + nums[nums.length / 2]) / 2
          : nums[Math.floor(nums.length / 2)];

      const variance = nums.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / nums.length;
      const stdDev = Math.sqrt(variance);

      meta.min = min;
      meta.max = max;
      meta.sum = Math.round(sum * 100) / 100;
      meta.mean = Math.round(mean * 100) / 100;
      meta.median = Math.round(median * 100) / 100;
      meta.stdDev = Math.round(stdDev * 100) / 100;
    }
  }

  return meta;
}

/**
 * Parses raw CSV string or file content into a typed Dataset
 */
export function parseCSVContent(
  content: string,
  fileName: string = 'dataset.csv',
  delimiter?: string
): { dataset?: Dataset; error?: string } {
  try {
    if (!content || !content.trim()) {
      return { error: 'The provided CSV content is empty.' };
    }

    // Strip BOM marker if present
    const cleanContent = content.replace(/^\uFEFF/, '');

    const parseResult = Papa.parse<Record<string, any>>(cleanContent, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      delimiter: delimiter || undefined, // PapaParse auto-detects if undefined
    });

    if (parseResult.errors.length > 0 && (!parseResult.data || parseResult.data.length === 0)) {
      return { error: `CSV Parsing error: ${parseResult.errors[0].message} (Row ${parseResult.errors[0].row})` };
    }

    const rows = parseResult.data.filter((row) => row && Object.keys(row).length > 0);

    if (rows.length === 0) {
      return { error: 'No data rows found in the CSV file.' };
    }

    const headers = parseResult.meta.fields || Object.keys(rows[0]);
    if (headers.length === 0) {
      return { error: 'Unable to detect header columns in the CSV file.' };
    }

    // Analyze each column
    const columns: ColumnMeta[] = headers.map((header) => {
      const rawValues = rows.map((r) => r[header]);
      const inferredType = inferColumnType(rawValues);
      return computeColumnMeta(header, rawValues, inferredType);
    });

    // Cast rows according to inferred types
    const typedData = rows.map((row, idx) => {
      const cleanRow: Record<string, any> = { _id: idx + 1 };
      for (const col of columns) {
        cleanRow[col.key] = castValue(row[col.key], col.type);
      }
      return cleanRow;
    });

    const dataset: Dataset = {
      id: `ds-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
      fileName,
      sizeBytes: new Blob([cleanContent]).size,
      uploadedAt: new Date().toISOString(),
      columns,
      data: typedData,
      totalRows: typedData.length,
      rawText: cleanContent.slice(0, 10000), // preview snippet
    };

    return { dataset };
  } catch (err: any) {
    return { error: err.message || 'Failed to parse CSV file' };
  }
}

/**
 * Export data array to CSV format
 */
export function exportToCSV(data: Record<string, any>[], filename: string = 'export.csv') {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data array to JSON format
 */
export function exportToJSON(data: Record<string, any>[], filename: string = 'export.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
