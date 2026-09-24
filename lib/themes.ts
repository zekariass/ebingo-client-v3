/**
 * Agent palette registry.
 *
 * Each palette is a set of CSS variable overrides defined in
 * app/agent-themes.css under `:root.theme-<key>` / `:root.dark.theme-<key>`.
 * The default palette ("default") lives in globals.css :root and needs no
 * class — `theme-default` is applied anyway for uniformity/devtools clarity.
 *
 * Resolution order (see app/agent-theme-sync.tsx):
 *   1. ?theme=<key> URL param          (preview / manual override)
 *   2. agent record `themeKey`         (fetched from /api/agents/<id>)
 *   3. localStorage cache              (flash-free repeat visits)
 *   4. DEFAULT_THEME_KEY
 */

export interface AgentTheme {
  /** Stored on the agent record / sent to the backend as `themeKey`. */
  key: string;
  /** Human-readable name shown in admin dropdowns. */
  label: string;
  /** CSS class applied to <html>. */
  className: string;
  /** Brand color used for the admin dropdown swatch. */
  swatch: string;
}

export const AGENT_THEMES: readonly AgentTheme[] = [
  { key: "default",       label: "Slate (Default)",   className: "theme-default",       swatch: "#343A40" },
  { key: "teal-coral",    label: "Teal Coral",        className: "theme-teal-coral",    swatch: "#0F766E" },
  { key: "violet-lime",   label: "Violet Lime",       className: "theme-violet-lime",   swatch: "#7C3AED" },
  { key: "terracotta",    label: "Terracotta",        className: "theme-terracotta",    swatch: "#B5451B" },
  { key: "ocean",         label: "Ocean",             className: "theme-ocean",         swatch: "#0369A1" },
  { key: "forest",        label: "Forest",            className: "theme-forest",        swatch: "#166534" },
  { key: "ruby",          label: "Ruby",              className: "theme-ruby",          swatch: "#9F1239" },
  { key: "royal",         label: "Royal",             className: "theme-royal",         swatch: "#4338CA" },
  { key: "sunset",        label: "Sunset",            className: "theme-sunset",        swatch: "#EA580C" },
  { key: "midnight",      label: "Midnight",          className: "theme-midnight",      swatch: "#1E40AF" },
  { key: "emerald-gold",  label: "Emerald Gold",      className: "theme-emerald-gold",  swatch: "#047857" },
  { key: "sakura",        label: "Sakura",            className: "theme-sakura",        swatch: "#E11D48" },
  { key: "arctic",        label: "Arctic",            className: "theme-arctic",        swatch: "#0891B2" },
  { key: "desert",        label: "Desert",            className: "theme-desert",        swatch: "#C2410C" },
  { key: "grape",         label: "Grape",             className: "theme-grape",         swatch: "#9333EA" },
  { key: "mocha",         label: "Mocha",             className: "theme-mocha",         swatch: "#92400E" },
  { key: "steel",         label: "Steel",             className: "theme-steel",         swatch: "#475569" },
  { key: "limeade",       label: "Limeade",           className: "theme-limeade",       swatch: "#4D7C0F" },
  { key: "candy",         label: "Candy",             className: "theme-candy",         swatch: "#C026D3" },
  { key: "olive",         label: "Olive",             className: "theme-olive",         swatch: "#64741B" },
  { key: "aurora",        label: "Aurora",            className: "theme-aurora",        swatch: "#0D9488" },
  { key: "crimson-noir",  label: "Crimson Noir",      className: "theme-crimson-noir",  swatch: "#991B1B" },
  { key: "cobalt",        label: "Cobalt",            className: "theme-cobalt",        swatch: "#1D4ED8" },
  { key: "lavender",      label: "Lavender",          className: "theme-lavender",      swatch: "#7C5CBF" },
  { key: "inferno",       label: "Inferno",           className: "theme-inferno",       swatch: "#B91C1C" },
  { key: "peacock",       label: "Peacock",           className: "theme-peacock",       swatch: "#0E7490" },
  { key: "bronze",        label: "Bronze",            className: "theme-bronze",        swatch: "#9A6B2F" },
  { key: "flamingo",      label: "Flamingo",          className: "theme-flamingo",      swatch: "#E2543E" },
  { key: "carbon",        label: "Carbon",            className: "theme-carbon",        swatch: "#1F2937" },
  { key: "marina",        label: "Marina",            className: "theme-marina",        swatch: "#1E3A5F" },
  { key: "neon-night",    label: "Neon Night",        className: "theme-neon-night",    swatch: "#4C1D95" },
  { key: "jade",          label: "Jade",              className: "theme-jade",          swatch: "#0E7A55" },
  { key: "amber-noir",    label: "Amber Noir",        className: "theme-amber-noir",    swatch: "#4A3319" },
  { key: "dusk",          label: "Dusk",              className: "theme-dusk",          swatch: "#5B4E9E" },
  { key: "champagne",     label: "Champagne",         className: "theme-champagne",     swatch: "#7A2438" },
  { key: "glacier",       label: "Glacier",           className: "theme-glacier",       swatch: "#27567E" },
  { key: "copper",        label: "Copper",            className: "theme-copper",        swatch: "#A85B2E" },
  { key: "indigo-rose",   label: "Indigo Rose",       className: "theme-indigo-rose",   swatch: "#4338CA" },
  { key: "pine",          label: "Pine",              className: "theme-pine",          swatch: "#1D4A34" },
  { key: "mauve",         label: "Mauve",             className: "theme-mauve",         swatch: "#8B4F82" },
  { key: "sage",          label: "Sage",              className: "theme-sage",          swatch: "#58754F" },
  { key: "plum",          label: "Plum",              className: "theme-plum",          swatch: "#5E2750" },
  { key: "rose-gold",     label: "Rose Gold",         className: "theme-rose-gold",     swatch: "#B76E79" },
  { key: "topaz",         label: "Topaz",             className: "theme-topaz",         swatch: "#0F7BA8" },
  { key: "orchid",        label: "Orchid",            className: "theme-orchid",        swatch: "#93379B" },
  { key: "solar",         label: "Solar",             className: "theme-solar",         swatch: "#A16207" },
  { key: "bamboo",        label: "Bamboo",            className: "theme-bamboo",        swatch: "#4F7A3A" },
  { key: "blush",         label: "Blush",             className: "theme-blush",         swatch: "#C4707F" },
  { key: "midas",         label: "Midas",             className: "theme-midas",         swatch: "#C9A227" },
  { key: "storm",         label: "Storm",             className: "theme-storm",         swatch: "#3B4A5A" },
] as const;

export const DEFAULT_THEME_KEY = "default";
export const DEFAULT_THEME_CLASS = "theme-default";

/** All theme classes — used to clear the active theme on <html>. */
export const THEME_CLASSES: readonly string[] = AGENT_THEMES.map((t) => t.className);

/** Classes from the old agent-N system — always stripped, never applied. */
export const LEGACY_THEME_CLASSES: readonly string[] = [
  "agent-1",
  "agent-2",
  "agent-3",
  "agent-4",
];

const KEY_TO_CLASS = new Map(AGENT_THEMES.map((t) => [t.key, t.className]));

export function isThemeKey(value: unknown): value is string {
  return typeof value === "string" && KEY_TO_CLASS.has(value);
}

/** key -> class. Unknown/missing keys resolve to the default class. */
export function themeClassForKey(key: unknown): string {
  return KEY_TO_CLASS.get(key as string) ?? DEFAULT_THEME_CLASS;
}

/** class -> key (inverse of themeClassForKey). */
export function themeKeyForClass(className: string): string {
  return AGENT_THEMES.find((t) => t.className === className)?.key ?? DEFAULT_THEME_KEY;
}

/** localStorage key used to cache the resolved palette per agent. */
export function themeCacheKey(agentId: number | string): string {
  return `agentTheme:${agentId}`;
}
