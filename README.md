# Smart Ticket Router — Frontend

Static single-page UI (plain HTML/CSS/JS, no build step) for the
[Smart Ticket Router API](../backend). Submit a raw support message and see
its routing decision — category, priority, assigned team, reasoning,
secondary category, and confidence.

## Run it

Any static file server works, e.g.:

```bash
python3 -m http.server 5173
# open http://localhost:5173
```

By default the app calls the API at `http://localhost:8000`. To point at a
different backend, set `window.API_BASE` before `app.js` loads:

```html
<script>window.API_BASE = "https://your-api.example.com";</script>
<script src="app.js"></script>
```

## Backend requirement

The API must have this frontend's origin in its `ALLOWED_ORIGINS` (CORS) —
see the [backend README](../backend/README.md). Local dev on ports 3000/5173
is allowed by default.
