# Goober Dash Rankings (mctiers-style)

A clean, local-first rankings site for **Goober Dash** that mimics the look + flow of **mctiers.com/rankings/overall** (dark leaderboard, tier grid, side legend/controls, paging) and includes a hidden admin login triggered by tapping the header icon.

## Tech
- Frontend: **React + Vite + TypeScript**
- Styling: **TailwindCSS** (primary font: **Baloo 2**)
- Backend: **Node + Express**
- Storage: JSON files (dev-friendly persistence)
- Tests: Vitest + Testing Library (unit + integration)

## Repo layout (required)
```
src/        # frontend source
public/     # static
backend/    # Express API
assets/     # placeholder + uploaded PNGs
config.json # central config
```

---

## Quick start (local)

### 1) Install
From the repo root:
```bash
npm install
```

### 2) Run frontend + backend (dev)
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:5174

Vite proxies `/api/*` and `/assets/*` to the backend automatically.

### 3) Run tests
```bash
npm test
```

---

## Editing config.json
The file **`config.json`** at the project root is the main configuration. The backend also mirrors it to `backend/data/config.json` for convenience.

Important fields:
- `siteTitle`: title shown in header
- `aspects`: aspect names shown as rating dropdowns
- `aspectWeights`: weights used for weighted average
- `defaultAspectValue`: numeric default used when an aspect is missing (1..5)
- `adminCredentials`: username/password used for the secret login
- `secretTapCount`: number of taps required on the header icon
- `secretTapWindowSeconds`: total allowed time window for the tap sequence
- `assetsFolder`: folder for PNG assets (default `assets`)
- `placeholderImage`: default placeholder PNG (default `assets/questionmark.png`)
- `discordServerLink`: shown on the Discord page and used by the nav
- `allowConfigEdit`: when true, admins can edit weights/default value in the UI
- `baseUrl`: reserved for future hosting (not required for local)

To change the Discord link, edit:
```json
"discordServerLink": "https://discord.gg/yourlink"
```

---

## Rankings logic (how overall is computed)
Ratings:
- HT1 = 5
- HT2 = 4
- HT3 = 3
- HT4 = 2
- LT5 = 1

Overall score = **weighted average** of the aspect numeric values. Missing aspects use `defaultAspectValue`.
- Score is rounded to **2 decimals**
- Percent is `score / 5 * 100` (shown as a whole-number percent)

The quick panel shows a full explanation string for every entry.

---

## Secret tap admin login (developer note)
There is a single clickable icon in the header (trophy).

- If you tap it **`secretTapCount`** times within **`secretTapWindowSeconds`**, the **Admin Login** modal appears.
- If you fail to complete within the window, the tap count resets.

Change these in `config.json`:
```json
"secretTapCount": 7,
"secretTapWindowSeconds": 3
```

### Dev-mode debug console
In development, a **Debug** button appears in the header. It shows the current tap count and time remaining.

---

## Admin editing
After login:
- An **ADMIN** badge appears in the header.
- The left sidebar shows an **Admin** card.
- Toggle **Admin editing: ON** to enable write actions.

Admin features:
- Add entry (name required, image optional)
- Bulk import entries from JSON
- Reset sample data
- Edit weights + default value (only when `allowConfigEdit=true`)

---

## Bulk import format (JSON file)
Upload a JSON file containing an array of entries:
```json
[
  {
    "name": "PlayerName",
    "image": "assets/somefile.png",
    "aspects": {
      "Movement": "HT2",
      "Attack": "HT3"
    },
    "notes": "optional"
  }
]
```
Unknown aspect keys are ignored. Missing aspects will use defaults.

---

## Images / assets
- **PNG only** everywhere.
- If an entry image is missing or fails to load, the app falls back to `assets/questionmark.png`.

### Recommended workflow for creating images
If you need new entry images, use **Sora** to generate or edit PNG images.
1) Generate your PNG in Sora
2) Copy the PNG into the repo’s `assets/` folder
3) Refresh the app and choose it in the entry editor, or reference it in entry JSON as `assets/<filename>.png`

---

## Backend storage + resetting data
Backend data lives in:
- `backend/data/entries.json`
- `backend/data/config.json`

To reset to the sample entries:
- Log in (admin)
- Toggle Admin editing ON
- Click **Reset sample data**

To fully clear all persisted state manually:
1) Stop the backend
2) Delete `backend/data/entries.json`
3) Restart `npm run dev`

---

## API endpoints
- `GET /api/config`
- `PUT /api/config` (admin + allowConfigEdit)
- `GET /api/entries`
- `POST /api/entries` (admin)
- `PUT /api/entries/:id` (admin)
- `DELETE /api/entries/:id` (admin)
- `POST /api/upload` (admin, PNG only)
- `POST /api/login`
- `GET /api/assets-manifest`
- `POST /api/dev/reset` (admin)

---

## QA checklist (manual)
Use this when verifying locally:

### Placeholder behavior
- [ ] Create an entry without uploading/choosing an image → placeholder appears
- [ ] Break an image path (edit JSON to a missing file) → UI falls back to placeholder

### Upload + assets
- [ ] Upload a PNG → backend saves it into `/assets/` and returns a path
- [ ] The uploaded file appears in the asset dropdown
- [ ] Non-PNG upload fails with a clear error

### Secret login
- [ ] Tap trophy icon 7 times within 3s → login modal appears
- [ ] Wait longer than window and tap again → counter resets

### Editing
- [ ] Logged in + Admin editing OFF → buttons disabled
- [ ] Logged in + Admin editing ON → can add/edit/delete entries
- [ ] If allowConfigEdit=false → config editor is hidden/disabled

