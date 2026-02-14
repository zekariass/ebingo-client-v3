// "use client";

// import { useEffect } from "react";
// import { useSearchParams } from "next/navigation";

// const AGENT_CLASSES = ["agent-1", "agent-2", "agent-4"] as const;

// export function AgentThemeSync() {
//   const searchParams = useSearchParams();
//   const agentIdParam = searchParams.get("agentId");

//   useEffect(() => {
//     const html = document.documentElement;
//     html.classList.remove(...AGENT_CLASSES);

//     const id = Number(agentIdParam);
//     const cls = id === 2 ? "agent-2" : "agent-1"; // default agent-1

//     html.classList.add(cls);
//   }, [agentIdParam]);

//   return null;
// }


"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const AGENT_CLASSES = ["agent-1", "agent-2", "agent-3", "agent-4"] as const;
type AgentClass = (typeof AGENT_CLASSES)[number];

const DEFAULT_AGENT: AgentClass = "agent-1";

// Map numeric agentId -> html class
const AGENT_ID_TO_CLASS: Record<number, AgentClass> = {
  1: "agent-1",
  2: "agent-2",
  3: "agent-3",
  4: "agent-4",
};

function resolveAgentClass(agentIdParam: string | null): AgentClass {
  if (!agentIdParam) return DEFAULT_AGENT;

  const id = Number(agentIdParam);
  if (!Number.isFinite(id)) return DEFAULT_AGENT;

  return AGENT_ID_TO_CLASS[id] ?? DEFAULT_AGENT;
}

export function AgentThemeSync() {
  const searchParams = useSearchParams();
  const agentIdParam = searchParams.get("agentId");

  useEffect(() => {
    const html = document.documentElement;

    // Remove all agent theme classes first
    html.classList.remove(...AGENT_CLASSES);

    // Add the resolved agent theme class
    html.classList.add(resolveAgentClass(agentIdParam));
  }, [agentIdParam]);

  return null;
}
