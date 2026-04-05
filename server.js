import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import handler from './api/generate.js';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Load .env manually
try {
  const env = readFileSync('.env', 'utf8');
  env.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) process.env[key.trim()] = val.trim();
  });
} catch {}

// Route API calls to your handler
app.post('/api/generate', (req, res) => handler(req, res));
app.options('/api/generate', (req, res) => handler(req, res));

app.listen(3000, () => console.log('Running at http://localhost:3000'));