import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

const __dirname = new URL('.', import.meta.url).pathname;

export function repoRoot() {
  // backend/ -> repoRoot
  return path.resolve(__dirname, '..');
}

export const DATA_DIR = path.join(__dirname, 'data');
export const ENTRIES_FILE = path.join(DATA_DIR, 'entries.json');
export const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
export const SEED_ENTRIES_FILE = path.join(DATA_DIR, 'seed-entries.json');

export async function ensureDataFiles() {
  await fsp.mkdir(DATA_DIR, { recursive: true });

  if (!fs.existsSync(CONFIG_FILE)) {
    const rootCfg = path.join(repoRoot(), 'config.json');
    const raw = await fsp.readFile(rootCfg, 'utf-8');
    await fsp.writeFile(CONFIG_FILE, raw, 'utf-8');
  }

  if (!fs.existsSync(ENTRIES_FILE)) {
    const seed = fs.existsSync(SEED_ENTRIES_FILE)
      ? await fsp.readFile(SEED_ENTRIES_FILE, 'utf-8')
      : '[]';
    await fsp.writeFile(ENTRIES_FILE, seed, 'utf-8');
  }
}

export async function readJson(filePath) {
  const raw = await fsp.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

export async function writeJson(filePath, obj) {
  const raw = JSON.stringify(obj, null, 2);
  await fsp.writeFile(filePath, raw, 'utf-8');
}

export async function readConfig() {
  return readJson(CONFIG_FILE);
}

export async function writeConfig(cfg) {
  await writeJson(CONFIG_FILE, cfg);
  // Keep repo root config.json in sync for easy editing
  const rootCfg = path.join(repoRoot(), 'config.json');
  await writeJson(rootCfg, cfg);
}

export async function readEntries() {
  return readJson(ENTRIES_FILE);
}

export async function writeEntries(entries) {
  await writeJson(ENTRIES_FILE, entries);
}

export async function resetToSeed() {
  const seed = await readJson(SEED_ENTRIES_FILE);
  await writeEntries(seed);
  // also reset config from repo root
  const rootCfg = await readJson(path.join(repoRoot(), 'config.json'));
  await writeConfig(rootCfg);
}

export async function buildAssetsManifest() {
  const root = repoRoot();
  const assetsDir = path.join(root, 'assets');
  const manifestPath = path.join(assetsDir, 'manifest.json');

  await fsp.mkdir(assetsDir, { recursive: true });
  const files = await fsp.readdir(assetsDir);
  const pngs = files.filter((f) => f.toLowerCase().endsWith('.png') && f !== 'manifest.json');

  const manifest = {};
  for (const f of pngs) {
    const key = path.parse(f).name;
    manifest[key] = `assets/${f}`;
  }
  await writeJson(manifestPath, manifest);
  return manifest;
}
