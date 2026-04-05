import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const handler = require('./api/generate.js');  // ✅ loads module.exports correctly

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Load .env file
try {
  const env = readFileSync('.env', 'utf8');
  env.split('\n').forEach(line => {
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) return;
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim();
    if (key) process.env[key] = val;
  });
  console.log('✅ Loaded .env');
} catch {
  console.warn('⚠️  No .env file found');
}

app.all('/api/generate', (req, res) => handler(req, res));

app.listen(3000, () => console.log('🚀 Running at http://localhost:3000'));