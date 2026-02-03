import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();

async function main() {
  const cfg = JSON.parse(await fs.readFile(path.join(ROOT, 'config.json'), 'utf-8'));
  const assetsDir = path.join(ROOT, cfg.assetsFolder || 'assets');

  let files = [];
  try {
    files = await fs.readdir(assetsDir);
  } catch {
    files = [];
  }

  const assets = files
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .map((f) => ({
      name: path.parse(f).name,
      path: `${cfg.assetsFolder || 'assets'}/${f}`.replace(/\\\\/g, '/'),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const manifest = { generatedAt: new Date().toISOString(), assets };
  await fs.writeFile(path.join(assetsDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`[assets] wrote ${assets.length} items to ${path.join(cfg.assetsFolder || 'assets', 'manifest.json')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
