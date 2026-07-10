# Smart Ticket Router — Frontend

Static single-page UI (TypeScript, no bundler) for the
[Smart Ticket Router API](../backend). Submit a raw support message and see
its routing decision — category, priority, assigned team, reasoning,
other issues (ranked), and confidence.

## Build

```bash
npm install
npm run build     # compiles src/app.ts -> dist/app.js
npm run watch     # or: recompile on change while developing
```

## Run it

```bash
npm run build
npm run serve     # python3 -m http.server 5173
# open http://localhost:5173
```

Any static file server works — it just needs to serve `index.html`,
`styles.css`, and the compiled `dist/app.js`.

By default the app calls the API at `http://localhost:8000`. To point at a
different backend, set `window.API_BASE` before the module script loads:

```html
<script>window.API_BASE = "https://your-api.example.com";</script>
<script type="module" src="dist/app.js"></script>
```

## Backend requirement

The API must have this frontend's origin in its `ALLOWED_ORIGINS` (CORS) —
see the [backend README](../backend/README.md). Local dev on ports 3000/5173
is allowed by default.
