# Smart Ticket Router — Frontend

React + TypeScript + Vite single-page UI for the
[Smart Ticket Router API](../backend). Submit a raw support message and see
its routing decision — category, priority, assigned team, reasoning,
other issues (ranked), and confidence.

## Structure

One component/hook/utility per file:

```
src/
  main.tsx, App.tsx, styles.css
  types/          request/response, history, and theme types
  constants/      API base URL, localStorage keys
  utils/          formatting, clipboard, priority-class helpers
  hooks/          useTheme, useApiHealth, useSamples, useTicketHistory,
                  useCountUp, useTicketRouter
  components/
    TopBar/       theme toggle, API status indicator, history button
    InputPanel/   ticket textarea, sample selector, error banner
    ResultPanel/  result card, loading/empty states, raw JSON viewer
    HistoryDrawer/
    Footer.tsx
```

## Develop

```bash
npm install
npm run dev       # starts the Vite dev server (default http://localhost:5173)
```

## Build

```bash
npm run build     # tsc -b && vite build -> dist/
npm run preview   # serve the production build locally
```

By default the app calls the API at `http://localhost:8000`. To point at a
different backend, set `window.API_BASE` before the app loads (e.g. in
`index.html`, before the module script tag):

```html
<script>window.API_BASE = "https://your-api.example.com";</script>
```

## Backend requirement

The API must have this frontend's origin in its `ALLOWED_ORIGINS` (CORS) —
see the [backend README](../backend/README.md). Local dev on ports 3000/5173
is allowed by default.
