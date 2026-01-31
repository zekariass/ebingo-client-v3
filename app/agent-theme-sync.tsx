"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const AGENT_CLASSES = ["agent-1", "agent-2"] as const;

export function AgentThemeSync() {
  const searchParams = useSearchParams();
  const agentIdParam = searchParams.get("agentId");

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove(...AGENT_CLASSES);

    const id = Number(agentIdParam);
    const cls = id === 2 ? "agent-2" : "agent-1"; // default agent-1

    html.classList.add(cls);
  }, [agentIdParam]);

  return null;
}
