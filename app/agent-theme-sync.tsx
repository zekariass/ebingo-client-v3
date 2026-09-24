"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import i18n from "@/i18n";
import {
  THEME_CLASSES,
  LEGACY_THEME_CLASSES,
  DEFAULT_THEME_CLASS,
  isThemeKey,
  themeClassForKey,
  themeCacheKey,
} from "@/lib/themes";

const ALL_THEME_CLASSES = [...THEME_CLASSES, ...LEGACY_THEME_CLASSES];

function applyThemeClass(className: string) {
  const html = document.documentElement;
  html.classList.remove(...ALL_THEME_CLASSES);
  html.classList.add(className);
}

function readCachedTheme(agentId: string | null): string | null {
  if (!agentId) return null;
  try {
    const cached = localStorage.getItem(themeCacheKey(agentId));
    return cached && THEME_CLASSES.includes(cached) ? cached : null;
  } catch {
    return null;
  }
}

export function AgentThemeSync() {
  const searchParams = useSearchParams();
  const agentIdParam = searchParams.get("agentId");
  const themeParam = searchParams.get("theme");

  useEffect(() => {
    // 1. Explicit ?theme=<key> override wins (preview / testing).
    if (isThemeKey(themeParam)) {
      applyThemeClass(themeClassForKey(themeParam));
      return;
    }

    // 2. Cached palette for this agent — applied instantly while the
    //    authoritative value is fetched below.
    const cached = readCachedTheme(agentIdParam);
    applyThemeClass(cached ?? DEFAULT_THEME_CLASS);

    // 3. Fetch the agent record and read `themeKey` off it.
    if (!agentIdParam || !Number.isFinite(Number(agentIdParam))) return;

    let cancelled = false;
    fetch(`/${i18n.language}/api/agents/${agentIdParam}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (cancelled) return;
        const cls = themeClassForKey(body?.data?.themeKey);
        try {
          localStorage.setItem(themeCacheKey(agentIdParam), cls);
        } catch {
          // private mode / quota — theme still applied for this session
        }
        applyThemeClass(cls);
      })
      .catch(() => {
        // Network/backend failure — keep whatever was applied above.
      });

    return () => {
      cancelled = true;
    };
  }, [agentIdParam, themeParam]);

  return null;
}
