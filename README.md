# 🗓️ Frugal Planner 2026

Dashboard digitale del **Frugal Planner** di Alessandro Martemucci.  
Backend su **Cloudflare Workers + D1**, frontend su **Cloudflare Pages**.

---

## 🏗️ Struttura

```
frugal-planner/
├── index.html          ← Frontend (Cloudflare Pages)
├── src/
│   └── worker.js       ← API Backend (Cloudflare Workers)
├── schema.sql          ← Schema database D1
├── wrangler.toml       ← Config Wrangler CLI
└── README.md
```

---

## 🚀 Deploy passo-passo

### 1. Installa Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### 2. Crea il database D1
```bash
wrangler d1 create frugal-planner-db
```
Copia il `database_id` che appare e incollalo in `wrangler.toml`:
```toml
database_id = "INCOLLA-QUI-IL-TUO-ID"
```

### 3. Inizializza lo schema del database
```bash
wrangler d1 execute frugal-planner-db --file=schema.sql
```

### 4. Deploy del Worker (API)
```bash
wrangler deploy
```
Copia l'URL del Worker (es: `https://frugal-planner-api.TUONOME.workers.dev`)

### 5. Aggiorna index.html
Apri `index.html` e sostituisci:
```javascript
const API = 'REPLACE_WITH_YOUR_WORKER_URL';
```
Con il tuo URL:
```javascript
const API = 'https://frugal-planner-api.TUONOME.workers.dev';
```

### 6. Deploy Frontend su Cloudflare Pages
1. Vai su [pages.cloudflare.com](https://pages.cloudflare.com)
2. **Connect to Git** → seleziona questo repository GitHub
3. Framework preset: **None**
4. Build command: *(lascia vuoto)*
5. Build output directory: `/`
6. **Save and Deploy**

---

## ✅ Funzionalità

| Feature | Descrizione |
|---|---|
| **6 categorie task** | Urgent, In Progress, Fast, Week, Plan, Waiting |
| **Salvataggio automatico** | Auto-save 1.2s dopo ogni modifica |
| **Storico settimane** | Naviga tra settimane passate |
| **Barra progresso** | % completamento settimanale in tempo reale |
| **Dark / Light mode** | Toggle manuale + rispetta sistema |
| **Note libere** | Area appunti per ogni settimana |

---

## 🔗 API Endpoints

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/api/weeks` | Lista tutte le settimane salvate |
| `GET` | `/api/week/:weekKey` | Carica dati di una settimana |
| `POST` | `/api/week/:weekKey` | Salva/aggiorna una settimana |
| `DELETE` | `/api/week/:weekKey` | Elimina una settimana |

**WeekKey format:** `2026-W17`

---

## 💰 Costo — tutto gratis

- Workers: 100.000 req/giorno
- D1: 5GB storage, 25M letture/giorno
- Pages: hosting illimitato

---

© 2026 — Basato su Frugal Planner® di Alessandro Martemucci
