import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '30mb' }));

// In-memory published dashboard cache
const publishedStore = new Map<string, any>();

// API route for publishing a dashboard
app.post('/api/publish', (req, res) => {
  const dashboard = req.body;
  if (!dashboard || !dashboard.id) {
    return res.status(400).json({ error: 'Missing dashboard payload' });
  }
  publishedStore.set(dashboard.id, dashboard);
  res.json({ success: true, id: dashboard.id });
});

// API route for getting published dashboard by ID
app.get('/api/published/:id', (req, res) => {
  const dashboard = publishedStore.get(req.params.id);
  if (!dashboard) {
    return res.status(404).json({ error: 'Published dashboard not found' });
  }
  res.json(dashboard);
});

// API route for AI data analysis with Gemini API
app.post('/api/analyze', async (req, res) => {
  try {
    const { query, datasetMeta, sampleData } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        answer: `Summary for "${datasetMeta?.name || 'Dataset'}": ${datasetMeta?.totalRows || 0} rows across ${datasetMeta?.columns?.length || 0} columns. Connect GEMINI_API_KEY in Secrets for real-time generative reasoning.`,
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a senior data analyst and BI expert.
The user is asking a question about their dataset in an interactive dashboard application.

Dataset: ${datasetMeta?.name || 'Dataset'}
Total Records: ${datasetMeta?.totalRows || 0}

Columns & Statistical Summary:
${JSON.stringify(datasetMeta?.columns, null, 2)}

Sample Data (First few rows):
${JSON.stringify(sampleData, null, 2)}

User Question: "${query}"

Provide a direct, concise, and accurate answer grounded in the numbers and fields provided. Keep it within 2-4 sentences. Do not use Markdown headers or bullet points; use clean, fluid professional prose.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const answer = response.text || 'Analysis completed successfully.';
    res.json({ answer });
  } catch (err: any) {
    console.error('Gemini API analysis error:', err);
    res.status(500).json({ error: err.message || 'Failed to complete AI data analysis' });
  }
});

// Mount Vite in development or static dist in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      port: PORT,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`DataStudio server running at http://0.0.0.0:${PORT}`);
});
