import { AggregationType, ChartConfig, ColumnMeta, Dataset, AIInsight } from '../types/data';

/**
 * Automatically proposes optimal default charts based on dataset columns
 */
export function generateDefaultCharts(dataset: Dataset): ChartConfig[] {
  const numericCols = dataset.columns.filter((c) => c.type === 'number');
  const stringCols = dataset.columns.filter((c) => c.type === 'string' && c.uniqueCount > 1 && c.uniqueCount <= 30);
  const dateCols = dataset.columns.filter((c) => c.type === 'date');

  const charts: ChartConfig[] = [];

  // Chart 1: Time series or Categorical breakdown
  if (dateCols.length > 0 && numericCols.length > 0) {
    charts.push({
      id: 'default-time-series',
      title: `${numericCols[0].name} Trend Over Time`,
      type: 'line',
      xAxis: dateCols[0].key,
      yAxis: [numericCols[0].key],
      aggregation: 'sum',
      colorPalette: 'indigo',
      sortOrder: 'asc',
      description: `Timeline tracking of ${numericCols[0].name} grouped by ${dateCols[0].name}.`,
    });
  } else if (stringCols.length > 0 && numericCols.length > 0) {
    charts.push({
      id: 'default-category-bar',
      title: `${numericCols[0].name} by ${stringCols[0].name}`,
      type: 'bar',
      xAxis: stringCols[0].key,
      yAxis: [numericCols[0].key],
      aggregation: 'sum',
      colorPalette: 'indigo',
      sortOrder: 'desc',
      description: `Aggregated total of ${numericCols[0].name} segmented by ${stringCols[0].name}.`,
    });
  }

  // Chart 2: Categorical Distribution / Share (Donut/Pie)
  if (stringCols.length > 0 && numericCols.length > 0) {
    // Choose second string col if available, else first
    const catCol = stringCols.length > 1 ? stringCols[1] : stringCols[0];
    const numCol = numericCols.length > 1 ? numericCols[1] : numericCols[0];
    charts.push({
      id: 'default-pie-share',
      title: `Distribution of ${numCol.name} by ${catCol.name}`,
      type: 'pie',
      xAxis: catCol.key,
      yAxis: [numCol.key],
      aggregation: 'sum',
      colorPalette: 'emerald',
      sortOrder: 'desc',
      description: `Proportional market share and distribution of ${numCol.name}.`,
    });
  }

  // Chart 3: Area or Multi-Metric Bar Chart
  if (numericCols.length >= 2) {
    const xCol = stringCols.length > 0 ? stringCols[0].key : (dateCols.length > 0 ? dateCols[0].key : dataset.columns[0].key);
    charts.push({
      id: 'default-multi-metric',
      title: `${numericCols[0].name} vs ${numericCols[1].name} Comparison`,
      type: 'area',
      xAxis: xCol,
      yAxis: [numericCols[0].key, numericCols[1].key],
      aggregation: 'avg',
      colorPalette: 'blue',
      sortOrder: 'desc',
      description: `Comparative volume analysis across ${xCol}.`,
    });
  }

  // Fallback if no specific condition matched
  if (charts.length === 0 && dataset.columns.length >= 2) {
    charts.push({
      id: 'default-simple-bar',
      title: `${dataset.columns[1].name} by ${dataset.columns[0].name}`,
      type: 'bar',
      xAxis: dataset.columns[0].key,
      yAxis: [dataset.columns[1].key],
      aggregation: 'count',
      colorPalette: 'violet',
      sortOrder: 'desc',
    });
  }

  return charts;
}

/**
 * Aggregates dataset rows for Recharts visualization
 */
export function aggregateDataForChart(
  data: Record<string, any>[],
  config: ChartConfig,
  columns: ColumnMeta[]
): Record<string, any>[] {
  const { xAxis, yAxis, aggregation, sortOrder } = config;

  if (!xAxis || !yAxis || yAxis.length === 0) return [];

  // Group by X axis value
  const groups: Record<string, any[]> = {};

  for (const row of data) {
    const rawX = row[xAxis];
    const xKey = rawX === null || rawX === undefined || rawX === '' ? '(Empty)' : String(rawX);

    if (!groups[xKey]) {
      groups[xKey] = [];
    }
    groups[xKey].push(row);
  }

  const result: Record<string, any>[] = [];

  for (const [xVal, rows] of Object.entries(groups)) {
    const item: Record<string, any> = { [xAxis]: xVal };

    for (const yKey of yAxis) {
      const vals = rows
        .map((r) => Number(r[yKey]))
        .filter((n) => !isNaN(n) && n !== null && n !== undefined);

      if (vals.length === 0) {
        item[yKey] = aggregation === 'count' ? rows.length : 0;
        continue;
      }

      if (aggregation === 'sum') {
        item[yKey] = Math.round(vals.reduce((a, b) => a + b, 0) * 100) / 100;
      } else if (aggregation === 'avg') {
        const sum = vals.reduce((a, b) => a + b, 0);
        item[yKey] = Math.round((sum / vals.length) * 100) / 100;
      } else if (aggregation === 'count') {
        item[yKey] = rows.length;
      } else if (aggregation === 'min') {
        item[yKey] = Math.min(...vals);
      } else if (aggregation === 'max') {
        item[yKey] = Math.max(...vals);
      }
    }

    result.push(item);
  }

  // Sort
  if (sortOrder === 'desc' && yAxis.length > 0) {
    const primaryY = yAxis[0];
    result.sort((a, b) => (Number(b[primaryY]) || 0) - (Number(a[primaryY]) || 0));
  } else if (sortOrder === 'asc' && yAxis.length > 0) {
    const primaryY = yAxis[0];
    result.sort((a, b) => (Number(a[primaryY]) || 0) - (Number(b[primaryY]) || 0));
  }

  // Limit top items to prevent browser lag if high cardinality
  return result.slice(0, 50);
}

/**
 * Generate automated statistical and heuristic insights from dataset
 */
export function generateAutomatedInsights(dataset: Dataset): AIInsight[] {
  const insights: AIInsight[] = [];
  const numericCols = dataset.columns.filter((c) => c.type === 'number' && c.mean !== undefined);
  const catCols = dataset.columns.filter((c) => c.type === 'string' && c.uniqueCount > 1);

  // 1. Data Integrity & Completeness Insight
  const totalCells = dataset.totalRows * dataset.columns.length;
  const totalNulls = dataset.columns.reduce((acc, c) => acc + c.nullCount, 0);
  const completeness = totalCells > 0 ? Math.round(((totalCells - totalNulls) / totalCells) * 100) : 100;

  if (completeness >= 98) {
    insights.push({
      id: 'ins-integrity-high',
      type: 'summary',
      title: 'High Data Quality & Integrity',
      description: `The dataset has a ${completeness}% completeness rating across ${dataset.totalRows.toLocaleString()} rows with negligible missing values. Clean for immediate analysis.`,
      confidence: 0.98,
    });
  } else {
    insights.push({
      id: 'ins-integrity-warning',
      type: 'anomaly',
      title: 'Missing Values Detected',
      description: `${totalNulls.toLocaleString()} missing cells (${100 - completeness}% gap) detected across fields. Consider applying imputation or row filtration in the Data Table tab.`,
      confidence: 0.92,
    });
  }

  // 2. Dominant Top Category Insight
  if (catCols.length > 0) {
    const topCat = catCols[0];
    if (topCat.distinctFrequencies && topCat.distinctFrequencies.length > 0) {
      const topVal = topCat.distinctFrequencies[0];
      const pct = Math.round((topVal.count / dataset.totalRows) * 100);
      insights.push({
        id: 'ins-top-category',
        type: 'trend',
        title: `Primary Concentration in ${topCat.name}`,
        description: `"${topVal.value}" represents ${pct}% of all records (${topVal.count} entries), indicating a notable concentration in this segment.`,
        metric: topCat.name,
        confidence: 0.95,
      });
    }
  }

  // 3. Highest Impact Numeric Metric
  if (numericCols.length > 0) {
    const topNum = numericCols[0];
    const formattedSum = topNum.sum !== undefined ? topNum.sum.toLocaleString() : 'N/A';
    const formattedMean = topNum.mean !== undefined ? topNum.mean.toLocaleString() : 'N/A';
    insights.push({
      id: 'ins-primary-metric',
      type: 'summary',
      title: `${topNum.name} Overall Volume`,
      description: `Total cumulative ${topNum.name} reached ${formattedSum} with an average of ${formattedMean} per record. Range spans from ${topNum.min} to ${topNum.max}.`,
      metric: topNum.name,
      confidence: 0.94,
    });

    // Skewness or outlier check
    if (topNum.mean !== undefined && topNum.median !== undefined) {
      const diff = Math.abs(topNum.mean - topNum.median);
      const ratio = topNum.mean > 0 ? diff / topNum.mean : 0;
      if (ratio > 0.25) {
        insights.push({
          id: 'ins-skew-detected',
          type: 'anomaly',
          title: `Distribution Skew in ${topNum.name}`,
          description: `Mean (${formattedMean}) departs significantly from median (${topNum.median}), signifying positive or negative heavy-tail skewness driven by outlier transactions.`,
          metric: topNum.name,
          confidence: 0.89,
        });
      }
    }
  }

  // 4. Multi-metric correlation or relationship
  if (numericCols.length >= 2) {
    insights.push({
      id: 'ins-multi-metric',
      type: 'correlation',
      title: `Comparative Ratio: ${numericCols[0].name} to ${numericCols[1].name}`,
      description: `Both key numerical indicators demonstrate multi-variant distributions. Use the Visualizer tab scatter or dual-axis view to evaluate correlation coefficients.`,
      confidence: 0.9,
    });
  }

  return insights;
}

/**
 * Rule-based natural language query answer generator for offline or instant queries
 */
export function queryDatasetLocally(query: string, dataset: Dataset): string {
  const q = query.toLowerCase().trim();

  // "How many rows / records"
  if (q.includes('how many') || q.includes('count') || q.includes('total rows')) {
    return `There are currently ${dataset.totalRows.toLocaleString()} rows and ${dataset.columns.length} columns in the "${dataset.name}" dataset.`;
  }

  // Search for column mentions
  const matchedCols = dataset.columns.filter((c) => q.includes(c.name.toLowerCase()) || q.includes(c.key.toLowerCase()));

  if (matchedCols.length > 0) {
    const col = matchedCols[0];
    if (col.type === 'number') {
      if (q.includes('average') || q.includes('mean')) {
        return `The average ${col.name} is ${col.mean?.toLocaleString()} (Median: ${col.median?.toLocaleString()}, Std Dev: ${col.stdDev?.toLocaleString()}).`;
      }
      if (q.includes('total') || q.includes('sum')) {
        return `The total sum of ${col.name} across all rows is ${col.sum?.toLocaleString()}.`;
      }
      if (q.includes('max') || q.includes('highest') || q.includes('top')) {
        return `The maximum value for ${col.name} is ${col.max?.toLocaleString()}.`;
      }
      if (q.includes('min') || q.includes('lowest')) {
        return `The minimum value for ${col.name} is ${col.min?.toLocaleString()}.`;
      }
      return `${col.name} has a total sum of ${col.sum?.toLocaleString()}, average of ${col.mean?.toLocaleString()}, spanning from ${col.min} to ${col.max}.`;
    }

    if (col.type === 'string') {
      const topVals = col.distinctFrequencies?.slice(0, 3).map((f) => `"${f.value}" (${f.count} rows)`).join(', ');
      return `Column "${col.name}" has ${col.uniqueCount} distinct values. Top occurrences: ${topVals || 'N/A'}.`;
    }
  }

  // General breakdown
  const numSummary = dataset.columns
    .filter((c) => c.type === 'number')
    .slice(0, 2)
    .map((c) => `${c.name} (avg: ${c.mean?.toLocaleString()})`)
    .join(', ');

  return `Based on "${dataset.name}": contains ${dataset.totalRows} records across ${dataset.columns.length} columns. Key metrics include ${numSummary || 'various attributes'}. Ask for specific averages, sums, or top categories!`;
}
