import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import fssync from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { computeComputed } from './scoring.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Repo root is one level above backend/
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const ROOT_CONFIG_PATH = path.join(ROOT_DIR, 'config.json');
const DATA_CONFIG_PATH = path.join(DATA_DIR, 'config.json');
const ENTRIES_PATH = path.join(DATA_DIR, 'entries.json');
const SEED_ENTRIES_PATH = path.join(DATA_DIR, 'seed-entries.json');

const sessions = new Map(); // token -> { createdAt }

async function readJson(p) {
  const raw = await fs.readFile(p, 'utf-8');
  return JSON.parse(raw);
}

async function writeJson(p, obj) {
  const tmp = p + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(obj, null, 2), 'utf-8');
  await fs.rename(tmp, p);
}

async function ensureDataFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  // Ensure root config exists
  if (!fssync.existsSync(ROOT_CONFIG_PATH)) {
    const defaultConfig = {
      siteTitle: 'Goober Dash Rankings',
      aspects: ['Movement', 'Attack', 'Defense', 'Utility'],
      aspectWeights: { Movement: 1.5, Attack: 1.2, Defense: 1.0, Utility: 0.8 },
      defaultAspectValue: 3,
      adminCredentials: { username: 'admin', password: 'gooberpass' },
      secretTapCount: 7,
      secretTapWindowSeconds: 3,
      assetsFolder: 'assets',
      placeholderImage: 'assets/questionmark.png',
      discordServerLink: 'https://discord.gg/yourlink',
      allowConfigEdit: true,
      baseUrl: ''
    };
    await writeJson(ROOT_CONFIG_PATH, defaultConfig);
  }

  // Mirror config into backend/data/config.json for convenience
  const rootConfig = await readJson(ROOT_CONFIG_PATH);
  if (!fssync.existsSync(DATA_CONFIG_PATH)) {
    await writeJson(DATA_CONFIG_PATH, rootConfig);
  }

  // Ensure seed entries
  if (!fssync.existsSync(SEED_ENTRIES_PATH)) {
    const seed = [
      {
        id: crypto.randomUUID(),
        name: 'GooberPrime',
        image: rootConfig.placeholderImage,
        aspects: { Movement: 'HT2', Attack: 'HT3', Defense: 'HT2', Utility: 'HT3' },
        notes: 'Sample entry'
      },
      {
        id: crypto.randomUUID(),
        name: 'DashWiz',
        image: rootConfig.placeholderImage,
        aspects: { Movement: 'HT1', Attack: 'HT3', Defense: 'HT4', Utility: 'HT2' },
        notes: 'Sample entry'
      },
      {
        id: crypto.randomUUID(),
        name: 'Crumbler',
        image: rootConfig.placeholderImage,
        aspects: { Movement: 'HT4', Attack: 'HT4', Defense: 'HT3', Utility: 'LT5' },
        notes: 'Sample entry'
      }
    ];
    await writeJson(SEED_ENTRIES_PATH, seed);
  }

  // Ensure entries.json
  if (!fssync.existsSync(ENTRIES_PATH)) {
    const seedEntries = await readJson(SEED_ENTRIES_PATH);
    const computedSeed = seedEntries.map((e) => ({
      ...e,
      computed: computeComputed(e.aspects ?? {}, rootConfig)
    }));
    await writeJson(ENTRIES_PATH, computedSeed);
  } else {
    // Recompute computed on startup in case config changed
    const cfg = await readJson(ROOT_CONFIG_PATH);
    const entries = await readJson(ENTRIES_PATH);
    const updated = entries.map((e) => ({
      ...e,
      computed: computeComputed(e.aspects ?? {}, cfg)
    }));
    await writeJson(ENTRIES_PATH, updated);
  }
}

async function loadConfig() {
  // Root config is the source of truth
  return readJson(ROOT_CONFIG_PATH);
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : (req.headers['x-session-token'] || '');
  if (!token || !sessions.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  req.sessionToken = token;
  next();
}

function pngOnlyFileFilter(req, file, cb) {
  const ok = file.mimetype === 'image/png' && file.originalname.toLowerCase().endsWith('.png');
  if (!ok) return cb(new Error('PNG only'));
  cb(null, true);
}

function createUploadMiddleware(assetsDir) {
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        await fs.mkdir(assetsDir, { recursive: true });
        cb(null, assetsDir);
      } catch (e) {
        cb(e);
      }
    },
    filename: (req, file, cb) => {
      cb(null, `${crypto.randomUUID()}.png`);
    }
  });
  return multer({ storage, fileFilter: pngOnlyFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
}

async function listAssets(assetsDir) {
  try {
    const files = await fs.readdir(assetsDir);
    return files
      .filter((f) => f.toLowerCase().endsWith('.png'))
      .map((f) => ({
        name: path.parse(f).name,
        path: `${(await loadConfig()).assetsFolder}/${f}`.replace(/\\/g, '/')
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

async function recomputeAllEntries(config) {
  const entries = await readJson(ENTRIES_PATH);
  const updated = entries.map((e) => ({ ...e, computed: computeComputed(e.aspects ?? {}, config) }));
  await writeJson(ENTRIES_PATH, updated);
  return updated;
}

async function main() {
  await ensureDataFiles();
  const config = await loadConfig();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  // Serve assets as static
  const assetsDir = path.join(ROOT_DIR, config.assetsFolder || 'assets');
  app.use('/assets', express.static(assetsDir));

  const upload = createUploadMiddleware(assetsDir);

  app.get('/api/config', async (req, res) => {
    const cfg = await loadConfig();
    res.json(cfg);
  });

  app.get('/api/entries', async (req, res) => {
    const entries = await readJson(ENTRIES_PATH);
    res.json(entries);
  });

  app.get('/api/assets-manifest', async (req, res) => {
    const cfg = await loadConfig();
    const dir = path.join(ROOT_DIR, cfg.assetsFolder || 'assets');
    const list = await listAssets(dir);
    res.json({ assets: list });
  });

  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body ?? {};
    const cfg = await loadConfig();
    const ok = username === cfg.adminCredentials?.username && password === cfg.adminCredentials?.password;
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = crypto.randomBytes(16).toString('hex');
    sessions.set(token, { createdAt: Date.now() });
    res.json({ token });
  });

  app.post('/api/entries', authRequired, async (req, res) => {
    const cfg = await loadConfig();
    const { name, aspects, image, notes } = req.body ?? {};
    if (!name || !String(name).trim()) return res.status(400).json({ error: 'Name is required' });

    const entries = await readJson(ENTRIES_PATH);
    const entry = {
      id: crypto.randomUUID(),
      name: String(name).trim(),
      image: image || cfg.placeholderImage,
      aspects: aspects || {},
      notes: notes || '',
      computed: computeComputed(aspects || {}, cfg)
    };
    entries.push(entry);
    await writeJson(ENTRIES_PATH, entries);
    res.status(201).json(entry);
  });

  app.put('/api/entries/:id', authRequired, async (req, res) => {
    const cfg = await loadConfig();
    const id = req.params.id;
    const entries = await readJson(ENTRIES_PATH);
    const idx = entries.findIndex((e) => e.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });

    const patch = req.body ?? {};
    const next = {
      ...entries[idx],
      ...patch,
      aspects: { ...(entries[idx].aspects || {}), ...(patch.aspects || {}) }
    };
    next.image = next.image || cfg.placeholderImage;
    next.computed = computeComputed(next.aspects || {}, cfg);

    entries[idx] = next;
    await writeJson(ENTRIES_PATH, entries);
    res.json(next);
  });

  app.delete('/api/entries/:id', authRequired, async (req, res) => {
    const id = req.params.id;
    const entries = await readJson(ENTRIES_PATH);
    const next = entries.filter((e) => e.id !== id);
    if (next.length === entries.length) return res.status(404).json({ error: 'Not found' });
    await writeJson(ENTRIES_PATH, next);
    res.json({ ok: true });
  });

  app.post('/api/upload', authRequired, upload.single('file'), async (req, res) => {
    const cfg = await loadConfig();
    if (!req.file) return res.status(400).json({ error: 'Missing file' });
    const rel = `${cfg.assetsFolder || 'assets'}/${req.file.filename}`.replace(/\\/g, '/');
    res.json({ path: rel });
  });

  app.put('/api/config', authRequired, async (req, res) => {
    const patch = req.body ?? {};
    const cfg = await loadConfig();
    if (!cfg.allowConfigEdit) return res.status(403).json({ error: 'Config editing disabled (allowConfigEdit=false)' });

    const next = { ...cfg, ...patch };
    await writeJson(ROOT_CONFIG_PATH, next);
    await writeJson(DATA_CONFIG_PATH, next);
    await recomputeAllEntries(next);
    res.json(next);
  });

  // Dev helper: reset entries to seed
  app.post('/api/dev/reset', authRequired, async (req, res) => {
    const cfg = await loadConfig();
    const seed = await readJson(SEED_ENTRIES_PATH);
    const next = seed.map((e) => ({ ...e, computed: computeComputed(e.aspects ?? {}, cfg) }));
    await writeJson(ENTRIES_PATH, next);
    res.json({ ok: true, count: next.length });
  });

  // error handler for multer fileFilter
  app.use((err, req, res, next) => {
    if (String(err?.message || '').includes('PNG only')) return res.status(400).json({ error: 'PNG only' });
    return res.status(500).json({ error: 'Server error', detail: err?.message });
  });

  const port = Number(process.env.PORT || 5174);
  app.listen(port, () => {
    console.log(`[backend] listening on http://localhost:${port}`);
    console.log(`[backend] assets served at /assets (dir: ${assetsDir})`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
