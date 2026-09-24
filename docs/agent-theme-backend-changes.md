# Backend change request: per-agent UI theme (`themeKey`)

## Goal

The web client now supports named color palettes (themes) that are applied
per-agent. The agent's chosen palette must be stored on the backend and exposed
on the agent record so the client can resolve it at runtime — no redeploy needed
when a theme is assigned or changed.

## Required change

Add a nullable string field **`themeKey`** to the Agent entity/DTOs.

### 1. Persistence

- `agents` table: `theme_key VARCHAR(64) NULL` (name up to you; JSON field name must be `themeKey`).
- Default: `NULL` (client treats `NULL`/missing as the built-in `"default"` palette).

### 2. Endpoints that must read it

- `GET /api/v1/agents/{id}` — include `themeKey` in the agent response. **This is the critical one**: the client reads `data.themeKey` here to pick the palette for players.
- `GET /api/v1/admin/agents/{id}/config` — include `themeKey` in `AgentConfigDto`.
- `GET /api/v1/admin/agents` (list) — include `themeKey`. The admin agent list renders a per-agent palette badge from this field; without it every card shows "Default".

### 3. Endpoints that must write it

- `PUT /api/v1/admin/agents/{id}/config` — accept `themeKey` on `AgentConfigUpdateDto` (nullable; `null` = reset to default). **Verified live** — returns and persists `themeKey` today.
- `PUT /api/v1/admin/agents/{id}` (agent update) — accept `themeKey` on the agent update DTO. The Edit Agent dialog uses this endpoint. (The frontend previously called `PUT /api/v1/agents/{id}`, which returns 405 — now corrected.)
- `POST /api/v1/admin/agents` (agent creation) — accept optional `themeKey` in the create payload. The client already sends it when the admin picks a non-default theme in the Create Agent dialog.

### 4. Validation

Valid values today (reject or coerce unknown values to `NULL` — either is fine,
the client falls back to `default` regardless):

```
default, teal-coral, violet-lime, terracotta, ocean, forest, ruby, royal,
sunset, midnight, emerald-gold, sakura, arctic, desert, grape, mocha,
steel, limeade, candy, olive, aurora, crimson-noir, cobalt, lavender,
inferno, peacock, bronze, flamingo, carbon, marina, neon-night, jade,
amber-noir, dusk, champagne, glacier, copper, indigo-rose, pine, mauve,
sage, plum, rose-gold, topaz, orchid, solar, bamboo, blush, midas, storm
```

The list is expected to grow; do not hard-fail on unrecognized values in a way
that breaks other config fields — just store/pass them through or null them.

### 5. No changes needed

- No new tables, no auth changes, no versioning.
- `system-configs` is an acceptable alternative storage (`name = "theme"`,
  `value = <themeKey>` per agent) **only if** it is also exposed on
  `GET /api/v1/agents/{id}` — otherwise the client cannot resolve it without
  admin credentials.

## Client-side contract (already implemented)

- `GET /{locale}/api/agents/{id}` proxies `GET /api/v1/agents/{id}` → reads `data.themeKey`.
- `?theme=<key>` URL param overrides everything (useful for previewing a palette before assigning).
- Palettes are compiled into the CSS bundle, so assigning an existing palette to any agent is instant and needs no frontend deploy. Adding a *new* palette requires a frontend deploy.
